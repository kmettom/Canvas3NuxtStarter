precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uTexturePrevious;
uniform sampler2D uTextureMaskNoise;
uniform float uTransitionProgress;
uniform vec2 uMeshSize;
uniform vec2 uTextureSize;

#define S(v) smoothstep(0., 1.5*fwidth(v), v)

vec2 mirror(vec2 v) {
    vec2 m = mod(v, 2.0);
    return mix(m, 2.0 - m, step(1.0, m));
}

float cubicInOut(float t) {
    return t < 0.5
    ? 4.0 * t * t * t
    : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

bool keyToggle(int ascii)
{
    return (texture(uTextureMaskNoise, vec2((.5+float(ascii))/256., 0.75)).x > 0.);
}

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

void main()
{
    vec2 uv = coverUv(vUv);

    vec3 col = 0.5 + 0.5*cos(uTransitionProgress+uv.xyx+vec3(0, 2, 4));
    float progress = cubicInOut(smoothstep(0.1, 0.9, uTransitionProgress));
    float mask = texture(uTextureMaskNoise, uv).r;

    float stepMask = S(mask - progress);
    vec4 img2 = texture(uTexturePrevious, mirror(vec2(uv.x + progress * mask, uv.y)));
    vec4 img1 = texture(uTexture, mirror(vec2(uv.x - (1. - progress) * mask, uv.y)));

    gl_FragColor = mix(img1, img2, stepMask);
}