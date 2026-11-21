precision highp float;

#define MAX_GLASS 6

varying vec2 vUv;
uniform sampler2D uSceneTexture;
uniform vec4 uBlocks[MAX_GLASS];
uniform int uBlockCount;
uniform vec2 uMeshSize;
uniform vec2 uViewport;
uniform vec2 uMouse;
uniform float uDevicePixelRatio;
uniform float uHoverProgress;
uniform float uUnHoverProgress;
uniform int uHoverBlockIndex;

float boxRadius = 20.0;

float createCircleMask(float radiusPx, float featherPx) {
    vec2 viewportUv = gl_FragCoord.xy / (uViewport * uDevicePixelRatio);
    vec2 mouseUv = vec2(uMouse.x, 1.0 - uMouse.y);

    float aspect = uViewport.x / uViewport.y;
    vec2 delta = viewportUv - mouseUv;
    delta.x *= aspect;

    float dist = length(delta);
    float radius = radiusPx / uViewport.y;
    float feather = featherPx / uViewport.y;

    return 1.0 - smoothstep(radius, radius + feather, dist);
}

vec4 glassPass(
        vec2 vUv,
        vec2 uv,
        vec4 baseColor,
        vec4 rect,
        float hoverActive,
        inout float touched
) {
    if (rect.z <= 0.0 || rect.w <= 0.0) {
        return baseColor;
    }

    vec2 glassCenter = vec2(0.5) + rect.xy / uMeshSize;
    vec2 glassHalfUv = rect.zw / uMeshSize;

    vec2 m2 = (vUv - glassCenter) / glassHalfUv;

    // Outside the block's rectangle the rounded box is > 1, so the glass has
    // no effect - skip the pow() and texture reads
    if (abs(m2.x) > 1.0 || abs(m2.y) > 1.0) {
        return baseColor;
    }

    float roundedBox = pow(abs(m2.x), boxRadius) + pow(abs(m2.y), boxRadius);

    float rb1 = clamp((1.00 - roundedBox) * 8.0, 0.0, 1.0);

    float rb2 =
    clamp((0.95 - roundedBox) * 16.0, 0.0, 1.0) -
    clamp((0.90 - roundedBox) * 16.0, 0.0, 1.0);

    float rb3 =
    clamp((1.50 - roundedBox) * 2.0, 0.0, 1.0) -
    clamp((1.00 - roundedBox) * 2.0, 0.0, 1.0);

    float transition = smoothstep(0.0, 1.0, rb1 + rb2);

    if (transition <= 0.0) {
        return baseColor;
    }
    touched = 1.0;

    float mouseCircle = createCircleMask(20.0, 125.0);

    // Cursor distortion mask
    float cursorBoost = mouseCircle * transition;

    /*
     * Hover reflection sweep.

     * uHoverProgress:
     * 0.0 -> top
     * 1.0 -> bottom
     */
    float progress = clamp(uHoverProgress, 0.0, 1.0);

    // m2.y is 1.0 at the top and -1.0 at the bottom.
    float reflectionY = mix(1.0, -1.0, progress);

    float reflectionDistance = abs(m2.y - reflectionY);

    // Width of the moving reflection distortion area.
    float reflectionWidth = 0.50;

    float reflection = 1.0 - smoothstep(
            0.0,
            reflectionWidth * (1.0 - uUnHoverProgress),
            reflectionDistance
    );

    // Fade the reflection near the rounded glass edges.
    float reflectionMask = transition * rb1;

    // Only the selected glass block receives the reflection distortion.
    float reflectionBoost =
    reflection *
    hoverActive *
    reflectionMask;

    // Use the same distortion pipeline for both the cursor and reflection.
    float boost = max(cursorBoost, reflectionBoost);

    vec2 fromCenter = vUv - glassCenter;
    float centerFalloff =
    1.0 - clamp(length(fromCenter / glassHalfUv), 0.0, 1.0);

    // Base lens distortion
    float distortStrength = 0.5 + boost * 0.9;
    vec2 distortDir =
    fromCenter * (0.15 + 0.35 * centerFalloff + 0.5 * boost);

    vec2 lensUv =
    glassCenter + fromCenter * (1.0 - roundedBox * distortStrength);

    lensUv += distortDir * 0.06 * boost;

    // Stronger local blur around mouse.
    // 5x5 taps at double spacing cover the same radius as the old 9x9 grid
    // (25 reads instead of 81); the half-res scene texture's bilinear
    // filtering fills in between the taps.
    vec4 blurred = vec4(0.0);
    float blurScale = (0.5 + boost * 1.75) * 2.0;

    for (float x = -2.0; x <= 2.0; x++) {
        for (float y = -2.0; y <= 2.0; y++) {
            vec2 off = vec2(x, y) * blurScale / uMeshSize;
            blurred += texture2D(uSceneTexture, lensUv + off);
        }
    }

    blurred /= 25.0;

    // RGB split along the distortion vector
    vec2 chromaDir = normalize(distortDir + vec2(0.00001));
    vec2 chromaOff = chromaDir * (0.004 + 0.012 * boost);

    vec4 aberration;
    aberration.r = texture2D(uSceneTexture, lensUv + chromaOff).r;
    aberration.g = texture2D(uSceneTexture, lensUv).g;
    aberration.b = texture2D(uSceneTexture, lensUv - chromaOff).b;
    aberration.a = 1.0;

    vec4 refracted = mix(
            blurred,
            aberration,
            0.35 + 0.45 * boost
    );

    vec2 m2uv = vUv - glassCenter;

    float gradient =
    clamp((clamp(m2uv.y, 0.0, 0.2) + 0.1) * 0.5, 0.0, 1.0) +
    clamp(
            (clamp(-m2uv.y, -1000.0, 0.2) * rb3 + 0.1) * 0.5,
            0.0,
            1.0
    );

    vec4 lighting = clamp(
            refracted
            - vec4(vec3(rb1 * gradient * 0.95), 0.0)
            - vec4(vec3(rb2 * 0.3), 0.0),
            0.0,
            1.0
    );

    // Slight highlight ring near cursor inside glass
    float ring =
    smoothstep(0.55, 1.0, mouseCircle) *
    (1.0 - smoothstep(0.85, 1.0, mouseCircle));

    lighting.rgb +=
    vec3(0.06, 0.08, 0.12) *
    ring *
    transition;

    // Optional low-intensity highlight over the RGB distortion area.
    // The actual reflection is now created by the distortion pipeline.
    float reflectionHighlight =
    reflectionBoost * 0.08;

    lighting.rgb += vec3(reflectionHighlight);

    float glassOpacity =
    clamp(0.85 + transition * 0.9, 0.0, 1.0);

    glassOpacity =
    clamp(glassOpacity + boost * 0.08, 0.0, 1.0);

    return mix(baseColor, lighting, glassOpacity);
}

bool insideBlock(vec2 vUv, vec4 rect) {
    vec2 glassCenter = vec2(0.5) + rect.xy / uMeshSize;
    vec2 glassHalfUv = rect.zw / uMeshSize;
    vec2 m2 = abs((vUv - glassCenter) / glassHalfUv);
    return m2.x <= 1.0 && m2.y <= 1.0;
}

void main() {
    vec2 uv = vUv;

    // Outside every block the glass changes nothing, and the scene under it is
    // already drawn at full resolution - discard instead of re-drawing the
    // (half-res) scene copy over it
    bool anyBlock = false;
    for (int i = 0; i < MAX_GLASS; i++) {
        if (i >= uBlockCount) {
            break;
        }
        if (uBlocks[i].z > 0.0 && insideBlock(vUv, uBlocks[i])) {
            anyBlock = true;
            break;
        }
    }
    if (!anyBlock) {
        discard;
    }

    vec4 color = texture2D(uSceneTexture, uv);
    float touched = 0.0;

    for (int i = 0; i < MAX_GLASS; i++) {
        if (i >= uBlockCount) {
            break;
        }

        float hoverActive =
        uHoverBlockIndex == i
        ? 1.0
        : 0.0;

        color = glassPass(
                vUv,
                uv,
                color,
                uBlocks[i],
                hoverActive,
                touched
        );
    }

    // Rounded corners of the block rect - also leave the full-res scene
    if (touched <= 0.0) {
        discard;
    }

    gl_FragColor = color;
}