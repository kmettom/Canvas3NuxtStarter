precision highp float;

#define MAX_GLASS 6

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTransitionProgress; // 0 -> 1
uniform float uAniInImage;
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

void main() {
    vec2 uv = coverUv(vUv);
    vec4 color = texture2D(uTexture, uv);

    gl_FragColor = color * uAniInImage * uTransitionProgress;
}
