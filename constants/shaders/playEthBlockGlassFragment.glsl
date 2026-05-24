precision highp float;

#define MAX_GLASS 6

varying vec2 vUv;
uniform float uAniInImage;
uniform vec4 uBlocks[MAX_GLASS];
uniform int uBlockCount;
uniform vec2 uMeshSize;
uniform float time;

vec4 glassPass(vec2 vUv, vec4 baseColor, vec4 rect) {
    vec2 glassCenter = vec2(0.5) + rect.xy / uMeshSize;
    vec2 glassHalfUv = rect.zw / uMeshSize;

    vec2 m2 = (vUv - glassCenter) / glassHalfUv;
    float boxRadius = 20.0;
    float roundedBox = pow(abs(m2.x), boxRadius) + pow(abs(m2.y), boxRadius);

    float rb1 = clamp((1.00 - roundedBox) * 8.0, 0.0, 1.0);
    float rb2 = clamp((0.95 - roundedBox) * 16.0, 0.0, 1.0)
    - clamp((0.90 - roundedBox) * 16.0, 0.0, 1.0);
    float rb3 = clamp((1.50 - roundedBox) * 2.0, 0.0, 1.0)
    - clamp((1.00 - roundedBox) * 2.0, 0.0, 1.0);

    float transition = smoothstep(0.0, 1.0, rb1 + rb2);
    if (transition <= 0.0) return baseColor;

    vec2 m2uv = vUv - glassCenter;
    float gradient =
    clamp((clamp(m2uv.y, 0.0, 0.2) + 0.1) * 0.5, 0.0, 1.0) +
    clamp((clamp(-m2uv.y, -1000.0, 0.2) * rb3 + 0.1) * 0.5, 0.0, 1.0);

    // Glass color: slight tint and alpha for "see-through" look
    vec4 glassColor = vec4(1.0, 1.0, 1.0, 0.1); 
    
    // Add highlights/edges
    vec4 lighting = glassColor + vec4(rb1) * gradient * 0.5 + vec4(rb2) * 0.5;
    lighting.a = clamp(glassColor.a + rb1 * 0.2 + rb2, 0.0, 1.0);

    return mix(baseColor, lighting, transition);
}

void main() {
    vec4 color = vec4(0.0);

    for (int i = 0; i < MAX_GLASS; i++) {
        if (i >= uBlockCount) break;
        color = glassPass(vUv, color, uBlocks[i]);
    }

    gl_FragColor = color * uAniInImage;
}
