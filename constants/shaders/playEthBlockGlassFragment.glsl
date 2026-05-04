precision highp float;

#define MAX_GLASS 6

varying vec2 vUv;
uniform sampler2D uTextureCurrent;
uniform sampler2D uTextureNext;
uniform float uTransitionProgress; // 0 -> 1
uniform float uAniInImage;
uniform vec4 uBlocks[MAX_GLASS];
uniform int uBlockCount;
uniform vec2 uMeshSize;
uniform vec2 uTextureSize;
uniform float time;

vec2 coverUv(vec2 raw) {
    float meshAspect = uMeshSize.x / uMeshSize.y;
    float textureAspect = uTextureSize.x / uTextureSize.y;
    vec2 uv = raw;
    if (meshAspect > textureAspect) {
        float s = textureAspect / meshAspect;
        uv.y = uv.y * s + (1.0 - s) * 0.5;
    } else {
        float s = meshAspect / textureAspect;
        uv.x = uv.x * s + (1.0 - s) * 0.5;
    }
    return uv;
}

vec4 glassPass(vec2 vUv, vec2 uv, vec4 baseColor, vec4 rect) {
    vec2 glassCenter = vec2(0.5) + rect.xy / uMeshSize;
    vec2 glassHalfUv = rect.zw / uMeshSize;

    vec2 m2 = (vUv - glassCenter) / glassHalfUv;
    float roundedBox = pow(abs(m2.x), 8.0) + pow(abs(m2.y), 8.0);

    float rb1 = clamp((1.00 - roundedBox) * 8.0, 0.0, 1.0);
    float rb2 = clamp((0.95 - roundedBox) * 16.0, 0.0, 1.0)
    - clamp((0.90 - roundedBox) * 16.0, 0.0, 1.0);
    float rb3 = clamp((1.50 - roundedBox) * 2.0, 0.0, 1.0)
    - clamp((1.00 - roundedBox) * 2.0, 0.0, 1.0);

    float transition = smoothstep(0.0, 1.0, rb1 + rb2);
    if (transition <= 0.0) return baseColor;

    vec2 lensVUv = glassCenter + (vUv - glassCenter) * (1.0 - roundedBox * 0.5);
    vec2 lensUv = coverUv(lensVUv);

    vec4 blurred = vec4(0.0);
    float total = 0.0;
    for (float x = -4.0; x <= 4.0; x++) {
        for (float y = -4.0; y <= 4.0; y++) {
            vec2 off = vec2(x, y) * 0.5 / uMeshSize;
            blurred += texture2D(uTextureCurrent, lensUv + off); // replace later if composing before glass
            total += 1.0;
        }
    }
    blurred /= total;

    vec2 m2uv = vUv - glassCenter;
    float gradient =
    clamp((clamp(m2uv.y, 0.0, 0.2) + 0.1) * 0.5, 0.0, 1.0) +
    clamp((clamp(-m2uv.y, -1000.0, 0.2) * rb3 + 0.1) * 0.5, 0.0, 1.0);

    vec4 lighting = clamp(blurred + vec4(rb1) * gradient + vec4(rb2) * 0.3, 0.0, 1.0);
    return mix(baseColor, lighting, transition);
}

vec4 getTransitionColor(vec2 uv) {
    vec4 fromColor = texture2D(uTextureCurrent, uv);
    vec4 toColor   = texture2D(uTextureNext, uv);

    float p = clamp(uTransitionProgress, 0.0, 1.0);

    // reveal new image from top to bottom
    float edge = 1.0 - p;
    float feather = 0.06;
    float mask = smoothstep(edge - feather, edge + feather, 1.0 - vUv.y);

    return mix(fromColor, toColor, mask);
}

void main() {
    vec2 uv = coverUv(vUv);
    vec4 color = getTransitionColor(uv);

    for (int i = 0; i < MAX_GLASS; i++) {
        if (i >= uBlockCount) break;
        color = glassPass(vUv, uv, color, uBlocks[i]);
    }

    gl_FragColor = color * uAniInImage;
}


//precision highp float;
//
//#define MAX_GLASS 10
//
//varying vec2 vUv;
//uniform sampler2D uImage;
//uniform float uAniInImage;
//uniform vec4 uBlocks[MAX_GLASS];
//uniform int uBlockCount;
//uniform float uHover;
//uniform float uBlockColor;
//uniform vec2 uMeshSize;
//uniform vec2 uTextureSize;
//uniform float time;
//varying float vNoise;
//
//// xy = center offset from mesh center (px), zw = half-size (px)
//
//vec2 coverUv(vec2 raw) {
//    float meshAspect    = uMeshSize.x / uMeshSize.y;
//    float textureAspect = uTextureSize.x / uTextureSize.y;
//    vec2 uv = raw;
//    if (meshAspect > textureAspect) {
//        float s = textureAspect / meshAspect;
//        uv.y = uv.y * s + (1.0 - s) * 0.5;
//    } else {
//        float s = meshAspect / textureAspect;
//        uv.x = uv.x * s + (1.0 - s) * 0.5;
//    }
//    return uv;
//}
//
//vec4 glassPass(vec2 vUv, vec2 uv, vec4 baseColor, vec4 rect) {
//    vec2 glassCenter = vec2(0.5) + rect.xy / uMeshSize;
//    vec2 glassHalfUv = rect.zw / uMeshSize;
//
//    vec2  m2         = (vUv - glassCenter) / glassHalfUv;
//    float roundedBox = pow(abs(m2.x), 8.0) + pow(abs(m2.y), 8.0);
//
//    float rb1 = clamp((1.00 - roundedBox) * 8.0, 0.0, 1.0);
//    float rb2 = clamp((0.95 - roundedBox) * 16.0, 0.0, 1.0)
//    - clamp((0.90 - roundedBox) * 16.0, 0.0, 1.0);
//    float rb3 = clamp((1.50 - roundedBox) * 2.0, 0.0, 1.0)
//    - clamp((1.00 - roundedBox) * 2.0, 0.0, 1.0);
//
//    float transition = smoothstep(0.0, 1.0, rb1 + rb2);
//
//    if (transition <= 0.0) return baseColor;
//
//    vec2 lensVUv = glassCenter + (vUv - glassCenter) * (1.0 - roundedBox * 0.5);
//    vec2 lensUv  = coverUv(lensVUv);
//
//    vec4  blurred = vec4(0.0);
//    float total   = 0.0;
//    for (float x = -4.0; x <= 4.0; x++) {
//        for (float y = -4.0; y <= 4.0; y++) {
//            vec2 off = vec2(x, y) * 0.5 / uMeshSize;
//            blurred += texture2D(uImage, lensUv + off);
//            total   += 1.0;
//        }
//    }
//    blurred /= total;
//
//    vec2  m2uv    = vUv - glassCenter;
//    float gradient = clamp((clamp(m2uv.y, 0.0, 0.2) + 0.1) * 0.5, 0.0, 1.0)
//    + clamp((clamp(-m2uv.y, -1000.0, 0.2) * rb3 + 0.1) * 0.5, 0.0, 1.0);
//
//    vec4 lighting = clamp(blurred + vec4(rb1) * gradient + vec4(rb2) * 0.3, 0.0, 1.0);
//
//    return mix(baseColor, lighting, transition);
//}
//
//void main() {
//    vec2 uv        = coverUv(vUv);
//    vec4 color     = texture2D(uImage, uv);
//
//    for (int i = 0; i < MAX_GLASS; i++) {
//        if (i >= uBlockCount) break;
//        color = glassPass(vUv, uv, color, uBlocks[i]);
//    }
//
//    gl_FragColor = color * uAniInImage;
//}
