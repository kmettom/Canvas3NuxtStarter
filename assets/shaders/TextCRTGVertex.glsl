// MSDF text vertex - the CRT look is all in TextCRTGFragment.glsl
// The only extra: each glyph quad is grown by PULL_PAD_PX, so the font pulled towards the trail / cursor
// can be drawn past its original glyph box. The fragment shader recovers the true uvs with vStretch.
attribute vec2 layoutUv;        // 0..1 across the whole text element (three-msdf-text-utils)
attribute vec2 glyphUv;         // 0..1 inside each glyph quad
attribute vec2 center;          // glyph center (font units, same space as position)

uniform vec2 uViewport;         // CSS px

varying vec2 vUv;               // all three are stretched over the grown quad
varying vec2 vLayoutUv;
varying vec2 vGlyphUv;
varying vec2 vStretch;          // original half size / grown half size, per glyph axis

// KEEP IN SYNC with PULL_PAD_PX in TextCRTGFragment.glsl - must be >= the largest pull there
const float PULL_PAD_PX = 5.0; // CSS px

// clip space -> viewport CSS px
vec2 clipToPx(vec4 clip) {
    return (clip.xy / clip.w * 0.5 + 0.5) * max(uViewport, vec2(1.0));
}

void main() {
    vUv = uv;
    vLayoutUv = layoutUv;
    vGlyphUv = glyphUv;

    mat4 mvp = projectionMatrix * modelViewMatrix;

    // push each corner out from the glyph center by PULL_PAD_PX on screen
    vec2 fromCenter = position.xy - center;
    vec2 halfSize = max(abs(fromCenter), vec2(0.0001));
    vec2 halfSizePx = abs(clipToPx(mvp * vec4(position, 1.0)) - clipToPx(mvp * vec4(center, position.z, 1.0)));
    vec2 pad = PULL_PAD_PX / max(halfSizePx / halfSize, vec2(0.0001)); // font units
    vStretch = halfSize / (halfSize + pad);

    vec3 pos = position;
    pos.xy += sign(fromCenter) * pad;
    gl_Position = mvp * vec4(pos, 1.0);
}
