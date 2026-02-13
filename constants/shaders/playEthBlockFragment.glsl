precision highp float;

varying vec2 vUv;
uniform sampler2D uImage;
uniform float uAniInImage;
uniform float uHover;
uniform float uBlockColor;

uniform vec2 uMeshSize;
uniform vec2 uTextureSize;



//vec3 applyColor(vec3 color) {
//    float r = color.r;
//    float g = color.g;
//    float b = color.b;
//
//    vec3 redColor = vec3(0.3216, 0.1020, 0.0471);
//    vec3 blueColor = vec3(0.6549, 0.3569, 0.1922);
//
//    return mix(redColor * uBlockColor, vec3(0.5), 0.5);
//}

vec3 blockRampColor(float t) {
    vec3 redColor  = vec3(82.0/255.0, 26.0/255.0, 12.0/255.0); // #521A0C
    vec3 blueColor = vec3(0.0/255.0, 1.0/255.0, 66.0/255.0);   // #000142
    vec3 neutral   = vec3(0.5);

    t = clamp(t, 0.0, 1.0);

    return (t < 0.5)
    ? mix(redColor, neutral, t / 0.5)
    : mix(neutral, blueColor, (t - 0.5) / 0.5);
}

vec3 applyColor(vec3 color) {
    vec3 tint = blockRampColor(uBlockColor);

    // luminance (perceptual grayscale)
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));

    // build a tinted version that preserves shading
    vec3 tinted = tint * luma;

    // mix original image with tinted image
    float strength = 1.0; // or make it a uniform, e.g. uTintStrength
    return mix(color, tinted, strength);
}


void main() {
    float meshAspect = uMeshSize.x / uMeshSize.y;
    float textureAspect = uTextureSize.x / uTextureSize.y;

    vec2 uv = vUv;
    if (meshAspect > textureAspect) {
        float scale = textureAspect / meshAspect;
        uv.y = uv.y * scale + (1.0 - scale) / 2.0; // Center the texture vertically
    } else {
        float scale = meshAspect / textureAspect;
        uv.x = uv.x * scale + (1.0 - scale) / 2.0; // Center the texture horizontally
    }

    vec4 tex = texture2D(uImage, uv);

    float sepiaMix = 1.0;

    vec3 color = mix(tex.rgb, applyColor(tex.rgb), sepiaMix);

    gl_FragColor = vec4(color, 1.0 * uAniInImage);
}
