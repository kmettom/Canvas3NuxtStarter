// Attributes from three-msdf-text-utils MSDFTextGeometry
attribute vec2 layoutUv;        // 0..1 across the whole text block
attribute vec2 glyphUv;         // 0..1 inside each glyph quad
attribute vec2 center;          // glyph center (font units, same space as position)
attribute float letterIndex;

uniform float uTime;
uniform float uTextAniIn;       // 0 -> 1 animate in
uniform vec2 uViewport;         // CSS px

varying vec2 vUv;               // all three are stretched over the expanded quad,
varying vec2 vLayoutUv;         // the fragment shader recovers the true values with vStretch
varying vec2 vGlyphUv;
varying vec2 vStretch;          // original half size / expanded half size, per glyph axis
varying float vSeed;

// Sweep wave - the text lifts as the reveal front passes over it and settles behind it
// KEEP IN SYNC with SWEEP_DIR / SWEEP_WIDTH in TextCRTBlurFragment.glsl
// direction in layoutUv space: (1,0) left -> right, (-1,0) right -> left, (0,1) / (0,-1) vertical
const vec2 SWEEP_DIR = vec2(1.0, 0.0);
const float SWEEP_WIDTH = 0.6;      // soft edge of the sweep front, fraction of the text size
const float WAVE_AMP = 0.0;         // displacement at the wave crest, font units (font size 42)
const float WAVE_CRESTS = 0.0;      // 1 = a single bump, 2+ = the front ripples (each crest alternates up / down)
const float PI = 3.14159265;

// Quad expansion - the fragment shader cuts the glyph into pieces and moves them (cursor pull, misalign, trail).
// The quad is grown by this margin so moved pieces can be drawn outside the original glyph box.
// KEEP IN SYNC with DEFORM_PAD_PX in TextCRTBlurFragment.glsl (>= the largest piece offset there)
const float DEFORM_PAD_PX = 20.0;   // CSS px

float hash(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
}

// local progress of a point on the text: 0 before the sweep front reaches it, 1 once it has passed
float sweepProgress(float p, vec2 uv) {
    vec2 dir = SWEEP_DIR;
    float s = dot(uv - 0.5, dir) / max(abs(dir.x) + abs(dir.y), 0.0001) + 0.5; // 0 = start side, 1 = end side
    return clamp((p * (1.0 + SWEEP_WIDTH) - s) / SWEEP_WIDTH, 0.0, 1.0);
}

// clip space -> viewport CSS px
vec2 clipToPx(vec4 clip, vec2 viewport) {
    return (clip.xy / clip.w * 0.5 + 0.5) * viewport;
}

void main() {
    vUv = uv;
    vLayoutUv = layoutUv;
    vGlyphUv = glyphUv;

    // per-glyph seed - same for every vertex of the glyph
    vSeed = hash(center.x * 0.137 + center.y * 0.071 + letterIndex * 1.31);

    vec3 pos = position;
    mat4 mvp = projectionMatrix * modelViewMatrix;

    // --- quad expansion: push each corner out from the glyph center by DEFORM_PAD_PX on screen ---
    vec2 viewport = max(uViewport, vec2(1.0));
    vec2 fromCenter = position.xy - center;
    vec2 halfSize = max(abs(fromCenter), vec2(0.0001));
    vec2 halfSizePx = abs(clipToPx(mvp * vec4(position, 1.0), viewport) - clipToPx(mvp * vec4(center, position.z, 1.0), viewport));
    vec2 pxPerUnit = max(halfSizePx / halfSize, vec2(0.0001));
    vec2 pad = DEFORM_PAD_PX / pxPerUnit; // font units
    pos.xy += sign(fromCenter) * pad;
    vStretch = halfSize / (halfSize + pad);

    // --- sweep wave: bump perpendicular to the sweep direction, 0 before and after the front ---
    float lp = sweepProgress(clamp(uTextAniIn, 0.0, 1.0), layoutUv);
    vec2 perp = normalize(vec2(-SWEEP_DIR.y, SWEEP_DIR.x));
    pos.xy += perp * sin(lp * PI * WAVE_CRESTS) * WAVE_AMP;

    gl_Position = mvp * vec4(pos, 1.0);
}
