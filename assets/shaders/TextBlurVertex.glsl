// Attributes from three-msdf-text-utils MSDFTextGeometry
attribute vec2 layoutUv;        // 0..1 across the whole text block
attribute vec2 glyphUv;         // 0..1 inside each glyph quad
attribute vec2 center;          // glyph center (font units)
attribute float letterIndex;

uniform float uTime;
uniform float uTextAniIn;       // 0 -> 1 animate in
uniform float uJumpAmount;      // optional - position jump in font units, default JUMP_AMOUNT

varying vec2 vUv;
varying vec2 vLayoutUv;
varying vec2 vGlyphUv;
varying float vSeed;

// The whole text jumps around while the light frame and the lines flicker in,
// it settles before the fill flickers in.
const float JUMP_AMOUNT = 6.0;  // font units (font size 42)
const float JUMP_FPS = 12.0;
const float JUMP_END = 0.6;     // uTextAniIn where the jumping stops

float hash(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
}

void main() {
    vUv = uv;
    vLayoutUv = layoutUv;
    vGlyphUv = glyphUv;

    // per-mesh seed - same for every vertex of the mesh, differs between meshes (word / char split)
    vSeed = hash(center.x * 0.137 + center.y * 0.071 + letterIndex * 1.31);

    vec3 pos = position;

    float p = clamp(uTextAniIn, 0.0, 1.0);
    if (p > 0.0 && p < JUMP_END) {
        float frame = floor(uTime * JUMP_FPS);
        float jumping = step(0.65, hash(frame + vSeed * 31.0));
        float amount = (uJumpAmount > 0.0 ? uJumpAmount : JUMP_AMOUNT) * (1.0 - p / JUMP_END);
        vec2 offset = vec2(
                hash(frame * 1.7 + vSeed * 13.0) - 0.5,
                (hash(frame * 2.3 + vSeed * 7.0) - 0.5) * 0.5
        ) * 2.0 * amount;
        pos.xy += offset * jumping;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
