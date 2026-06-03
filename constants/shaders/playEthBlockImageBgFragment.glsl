precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uTexturePrevious;
uniform float uTransitionProgress;
uniform vec2 uMeshSize;
uniform vec2 uTextureSize;
uniform float time;
uniform float uColAmount;

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

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = coverUv(vUv);
    vec4 color = texture2D(uTexture, uv);
    vec4 colorPrev = texture2D(uTexturePrevious, uv);

    float cols = uColAmount;
    float meshAR = uMeshSize.x / max(uMeshSize.y, 1.0);
    float rows = max(1.0, floor(cols / meshAR));
    vec2 grid = vec2(cols, rows);

    vec2 tileId = floor(vUv * grid);
    float x01 = 1.0 - (tileId.y + 0.5) / grid.y;
    float rnd = hash21(tileId);

    float jitter = (rnd - 0.5) * 0.15;
    float w = 0.10;
    float t0 = clamp(x01 + jitter, 0.0, 1.0 - w);

    float tileMask = smoothstep(
    t0,
    t0 + w,
    clamp(uTransitionProgress, 0.0, 1.0)
    );

    vec4 finalColor = mix(colorPrev, color, tileMask);
    gl_FragColor = vec4(finalColor.rgb, finalColor.a);
}