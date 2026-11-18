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
const float JUMP_AMOUNT = 0.0;  // font units (font size 42)
const float JUMP_FPS = 0.0;
const float JUMP_END = 0.0;     // uTextAniIn where the jumping stops

// Sweep wave - the text lifts as the reveal front passes over it and settles behind it
// KEEP IN SYNC with SWEEP_DIR / SWEEP_WIDTH in TextBlurFragment.glsl
// direction in layoutUv space: (1,0) left -> right, (-1,0) right -> left, (0,1) / (0,-1) vertical
const vec2 SWEEP_DIR = vec2(1.0, 0.0);
const float SWEEP_WIDTH = 0.6;      // soft edge of the sweep front, fraction of the text size
const float WAVE_AMP = 0.0;         // displacement at the wave crest, font units (font size 42)
const float WAVE_CRESTS = 0.0;      // 1 = a single bump, 2+ = the front ripples (each crest alternates up / down)
const float PI = 3.14159265;

float hash(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
}

// local progress of a point on the text: 0 before the sweep front reaches it, 1 once it has passed
float sweepProgress(float p, vec2 uv) {
    vec2 dir = SWEEP_DIR;
    float s = dot(uv - 0.5, dir) / max(abs(dir.x) + abs(dir.y), 0.0001) + 0.5; // 0 = start side, 1 = end side
    return clamp((p * (1.0 + SWEEP_WIDTH) - s) / SWEEP_WIDTH, 0.0, 1.0);
}

void main() {
    vUv = uv;
    vLayoutUv = layoutUv;
    vGlyphUv = glyphUv;

    // per-mesh seed - same for every vertex of the mesh, differs between meshes (word / char split)
    vSeed = hash(center.x * 0.137 + center.y * 0.071 + letterIndex * 1.31);

    vec3 pos = position;

    // --- sweep wave: bump perpendicular to the sweep direction, 0 before and after the front ---
    float lp = sweepProgress(clamp(uTextAniIn, 0.0, 1.0), layoutUv);
    vec2 perp = normalize(vec2(-SWEEP_DIR.y, SWEEP_DIR.x));
    pos.xy += perp * sin(lp * PI * WAVE_CRESTS) * WAVE_AMP;

//    float p = clamp(uTextAniIn, 0.0, 1.0);
//    if (p > 0.0 && p < JUMP_END) {
//        float frame = floor(uTime * JUMP_FPS);
//        float jumping = step(0.65, hash(frame + vSeed * 31.0));
//        float amount = (uJumpAmount > 0.0 ? uJumpAmount : JUMP_AMOUNT) * (1.0 - p / JUMP_END);
//        vec2 offset = vec2(
//                hash(frame * 1.7 + vSeed * 13.0) - 0.5,
//                (hash(frame * 2.3 + vSeed * 7.0) - 0.5) * 0.5
//        ) * 2.0 * amount;
//        pos.xy += offset * jumping;
//    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
