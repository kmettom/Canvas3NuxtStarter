precision highp float;

varying vec2 vUv;
uniform sampler2D uImage;
uniform float uAniInImage;

uniform vec2 uMeshSize;
uniform vec2 uTextureSize;

// Function to apply a sepia tone to a given RGB color
vec3 applySepia(vec3 color) {
    float r = color.r;
    float g = color.g;
    float b = color.b;

    vec3 sepiaColor = vec3(
    clamp(r * 0.10 + g * 0.10 + b * 0.10, 0.0, 1.0),
    clamp(r * 0.10 + g * 0.10 + b * 0.10, 0.0, 1.0),
    clamp(r * 0.10 + g * 0.10 + b * 0.10, 0.0, 1.0)
    );
    return mix(sepiaColor, vec3(0.5), 0.5);
}

void main() {
    // Calculate the aspect ratios
    float meshAspect = uMeshSize.x / uMeshSize.y;
    float textureAspect = uTextureSize.x / uTextureSize.y;

    // Adjust UV coordinates to maintain aspect ratio
    vec2 uv = vUv;
    if (meshAspect > textureAspect) {
        // Mesh is wider than the texture
        float scale = textureAspect / meshAspect;
        uv.y = uv.y * scale + (1.0 - scale) / 2.0; // Center the texture vertically
    } else {
        // Mesh is taller than the texture
        float scale = meshAspect / textureAspect;
        uv.x = uv.x * scale + (1.0 - scale) / 2.0; // Center the texture horizontally
    }

    vec4 tex = texture2D(uImage, uv);

    // If you want purely the image, set sepiaMix = 0.0.
    // If you want full sepia, set sepiaMix = 1.0.
    float sepiaMix = 1.0;

    vec3 color = mix(tex.rgb, applySepia(tex.rgb), sepiaMix);

    gl_FragColor = vec4(color, 1.0 * uAniInImage);
}
