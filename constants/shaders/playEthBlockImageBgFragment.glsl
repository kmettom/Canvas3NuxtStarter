precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uTexturePrevious;
//uniform sampler2D uDisplacementMap; // noise/mask texture (was iChannel0)
uniform float uTransitionProgress;
uniform vec2 uMeshSize;
uniform vec2 uTextureSize;

#define S(v) smoothstep(0.0, 1.5 * fwidth(v), v)

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

vec2 mirror(vec2 v) {
    vec2 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}

void main() {
    vec2 uv = coverUv(vUv);

    //    float mask = texture2D(uDisplacementMap, vUv).r;
    float mask = texture2D(uTexture, vUv).r;

    float stepMask = S(mask - uTransitionProgress);

    vec4 img2 = texture2D(uTexture, mirror(vec2(uv.x + uTransitionProgress * mask, uv.y)));
    vec4 img1 = texture2D(uTexturePrevious, mirror(vec2(uv.x - (1.0 - uTransitionProgress) * mask, uv.y)));

    vec4 finalColor = mix(img1, img2, stepMask);
    gl_FragColor = vec4(finalColor.rgb, finalColor.a);
}