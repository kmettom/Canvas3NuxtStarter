precision highp float;

// Flickering grayscale cells (circles -> rectangles) with a light frame.
// The glyph is also cut into pieces along the same cells - each piece is moved on its own
// (misalign while the effect plays, pull towards the cursor, drag along the trail), which deforms the letters.

varying vec2 vUv;               // stretched over the expanded quad - see TextCRTBWVertex.glsl
varying vec2 vLayoutUv;
varying vec2 vGlyphUv;
varying vec2 vStretch;
varying float vSeed;

uniform sampler2D uMap;
uniform vec3 uColor;            // final fill color
uniform float uAlphaTest;
uniform float uTime;
uniform vec2 uMeshSize;         // CSS px
uniform vec2 uMouse;            // viewport 0..1, y from the top (set by Canvas3)
uniform vec2 uViewport;         // CSS px
uniform float uDevicePixelRatio;

uniform float uTextAniIn;       // 0 -> 1 animate in

// Trail simulation (canvas3-options simulations.trail) - set by Canvas3, declaring them turns the simulation on
// r = trail intensity 0..1, gb = cursor direction there (screen space)
uniform sampler2D uSimTrail;
uniform vec2 uSimTrailResolution; // drawing buffer, device px - gl_FragCoord / this = screen uv

// Optional - unset uniforms are 0, so the defaults below are used
uniform vec3 uLightColor;       // color of the light frame and the lines
uniform float uFlickerFps;

const float DISTANCE_COEF = 0.5;

// Stages on uTextAniIn - they overlap, so one starts flickering while the previous is still on
// 1. light frame (glyph outline + glow)  2. grayscale cells inside  3. fill color
const vec2 BORDER_STAGE = vec2(0.0, 0.35);
const vec2 LINES_STAGE = vec2(0.2, 0.7);
const vec2 FILL_STAGE = vec2(0.6, 1.0);
// cells morph from circles (0) to rectangles that close all gaps (1)
const vec2 MORPH_STAGE = vec2(0.25, 0.85);

const vec3 DEFAULT_LIGHT = vec3(0.9, 0.97, 1.0);
const float DEFAULT_FLICKER_FPS = 24.0;

const float BORDER_PX = 1.6;     // outline thickness, screen px
const float GLOW_PX = 6.0;       // outer glow falloff, screen px
const float DOT_RADIUS_PX = 1.0; // radius of the starting circles, CSS px
const float DOT_GAP_PX = 5.0;    // gap between circles at the start, CSS px
const float CELL_PX = DOT_RADIUS_PX * 2.0 + DOT_GAP_PX; // grid cell size, CSS px
const float BAND_COUNT = 5.0;    // horizontal bands the streaks are broken into
const float GRAY_LEVELS = 3.0;   // 3 = black / gray / white

// Cursor reveal - pixels within the radius get animated in, the closer to the cursor the further
const float CURSOR_RADIUS_PX = 250.0; // CSS px
const float CURSOR_FALLOFF = 4.0;     // > 1 = tighter center, < 1 = wider affected area
const float CURSOR_CENTER_PROGRESS = 0.0; // progress right under the cursor (0 = fully back to the start of the effect)
// the cursor has no effect during the reveal, it fades in over this range of uTextAniIn at the very end
const vec2 CURSOR_ENABLE_STAGE = vec2(0.95, 1.0);

// Trail - the cursor path pulls the progress back towards CURSOR_CENTER_PROGRESS like the cursor radius, so the cells
// morph along the trail and the text fills back in as the trail fades. Fades in with the cursor (CURSOR_ENABLE_STAGE).
const float TRAIL_FALLOFF = 1.5;   // > 1 = only the fresh part of the trail goes far back, < 1 = the whole trail
const float TRAIL_SMEAR_PX = 10.0; // the cell grid is dragged along the cursor direction, CSS px

// Deform - the glyph is cut into pieces of CELL_PX (the cells) and every piece is moved on its own
// KEEP IN SYNC: DEFORM_PAD_PX in TextCRTBWVertex.glsl must be >= the largest offset
// (PULL_MAX_PX + length(MISALIGN_PX) + TRAIL_DRAG_PX), anything further is cut off at the quad edge
const float DEFORM_PAD_PX = 40.0;
const vec2 MISALIGN_PX = vec2(3.0, 2.0); // piece jump while the effect plays on it (scaled by 1 - progress), CSS px
const float MISALIGN_FPS = 12.0;         // re-roll rate during the reveal, frozen after it (like the flicker)
const float PULL_STRENGTH = 0.25;        // pieces in the cursor radius move this fraction of their distance to the cursor
const float PULL_MAX_PX = 25.0;          // max pull, CSS px
const float TRAIL_DRAG_PX = 8.0;         // pieces on the trail are dragged along the cursor direction, CSS px

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float hash(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
}

float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float stageProgress(float p, vec2 stage) {
    return clamp((p - stage.x) / (stage.y - stage.x), 0.0, 1.0);
}

mat2 inverse2(mat2 m) {
    float det = m[0][0] * m[1][1] - m[1][0] * m[0][1];
    det = abs(det) < 1e-12 ? 1e-12 : det;
    return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det;
}

float flickerFrame() {
    return floor(uTime * (uFlickerFps > 0.0 ? uFlickerFps : DEFAULT_FLICKER_FPS));
}

// On / off flicker - off at 0, on more and more often while progressing, steady on at 1
float flicker(float progress, float seed) {
    if (progress <= 0.0) return 0.0;
    if (progress >= 1.0) return 1.0;
    float r = hash(flickerFrame() * 1.37 + seed * 17.0 + vSeed * 53.0);
    // a bit of brightness variation while flickering
    return step(r, progress) * mix(0.55, 1.0, hash(r * 91.0));
}

// steady 0 = flicker in (the reveal), 1 = plain fade by progress, no flicker (the cursor area after the reveal)
float stageOn(float progress, float seed, float steady) {
    return mix(flicker(progress, seed), progress, steady);
}

// Grid of cells grouped into vertical streaks broken into horizontal bands, like a pixel-sorted / scanned light.
// density 0..1 = how many of the streaks are lit
// morph   0..1 = circle (DOT_RADIUS_PX) -> rectangle filling the whole cell (gaps closed)
// aa = CSS px per screen px
// returns x = gray level (0 black .. 1 white), y = coverage
vec2 cells(vec2 px, float density, float frame, float morph, float aa) {
    vec2 cellId = floor(px / CELL_PX);
    vec2 local = px - (cellId + 0.5) * CELL_PX; // position relative to the cell center
    float col = cellId.x;

    // bands with a per-column vertical offset, so the streak ends are ragged
    float bandH = max(uMeshSize.y, 1.0) / BAND_COUNT;
    float cellY = (cellId.y + 0.5) * CELL_PX;
    float band = floor(cellY / bandH + (hash(col * 0.73 + vSeed) - 0.5) * 0.6);

    // the pattern is re-rolled only every few flicker frames, so it reads as streaks, not noise
    float slowFrame = floor(frame / 3.0);
    float lit = step(1.0 - density, hash2(vec2(col, band + slowFrame * 7.0) + vSeed));

    // black / gray / white per streak
    float level = floor(hash2(vec2(col * 1.3, band) + vSeed * 0.37) * GRAY_LEVELS) / max(GRAY_LEVELS - 1.0, 1.0);

    // rounded box: circle at morph 0, slightly oversized sharp rectangle at morph 1 (no seams between cells)
    vec2 halfSize = mix(vec2(DOT_RADIUS_PX), vec2(CELL_PX * 0.5 + 0.5), morph);
    float corner = mix(DOT_RADIUS_PX, 0.0, morph);
    vec2 q = abs(local) - halfSize + corner;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - corner;

    float shape = clamp(0.5 - d / aa, 0.0, 1.0);

    return vec2(level, lit * shape);
}

// 1 at the cursor -> 0 at CURSOR_RADIUS_PX and beyond
float cursorInfluence(vec2 cssPx) {
    vec2 cursorPx = vec2(uMouse.x, 1.0 - uMouse.y) * uViewport;
    float t = 1.0 - smoothstep(0.0, CURSOR_RADIUS_PX, distance(cssPx, cursorPx));
    return pow(t, CURSOR_FALLOFF);
}

vec3 sampleTrail(vec2 devicePx) {
    return textureLod(uSimTrail, devicePx / max(uSimTrailResolution, vec2(1.0)), 0.0).rgb;
}

// Offset of one piece (cell) in CSS px - evaluated at the piece center, so the whole piece moves as one
// fragDev / layPx: this fragment in device px / layout px, layToDev: layout px -> device px
vec2 pieceOffset(vec2 cellId, vec2 fragDev, vec2 layPx, mat2 layToDev, float aniIn, float cursorOn, float dpr) {
    vec2 centerLay = (cellId + 0.5) * CELL_PX;
    vec2 centerDev = fragDev + layToDev * (centerLay - layPx);
    vec2 centerCss = centerDev / dpr;

    // same progress as the cells use, at the piece center
    float influence = cursorInfluence(centerCss) * cursorOn;
    vec3 trail = sampleTrail(centerDev) * cursorOn;
    float trailStrength = pow(clamp(trail.r, 0.0, 1.0), TRAIL_FALLOFF);
    float cursorP = mix(1.0, CURSOR_CENTER_PROGRESS, max(influence, trailStrength));
    float effect = 1.0 - min(aniIn, cursorP);

    // misalign - stepped jumps per piece, re-rolled during the reveal, frozen after it
    float frame = cursorOn > 0.0 ? 0.0 : floor(uTime * MISALIGN_FPS);
    vec2 jump = vec2(
            hash2(cellId + frame * 1.7),
            hash2(cellId.yx + frame * 2.3 + 5.1)
    ) * 2.0 - 1.0;
    vec2 offset = jump * MISALIGN_PX * effect;

    // pull towards the cursor
    vec2 toCursor = vec2(uMouse.x, 1.0 - uMouse.y) * uViewport - centerCss;
    vec2 pull = toCursor * PULL_STRENGTH * influence;
    float pullLen = length(pull);
    if (pullLen > PULL_MAX_PX) pull *= PULL_MAX_PX / pullLen;

    return offset + pull + trail.gb * TRAIL_DRAG_PX;
}

void main() {
    float dpr = uDevicePixelRatio > 0.0 ? uDevicePixelRatio : 1.0;
    float aniIn = clamp(uTextAniIn, 0.0, 1.0);
    float cursorOn = stageProgress(aniIn, CURSOR_ENABLE_STAGE);
    vec2 fragDev = gl_FragCoord.xy;

    // --- undo the quad expansion: true glyph uv / atlas uv / layout uv at this fragment ---
    // (all derivatives are taken here, before anything is moved or discarded)
    vec2 g = 0.5 + (vGlyphUv - 0.5) / max(vStretch, vec2(0.0001));
    mat2 invGs = inverse2(mat2(dFdx(vGlyphUv), dFdy(vGlyphUv)));
    mat2 uvPerG = mat2(dFdx(vUv), dFdy(vUv)) * invGs;
    mat2 layPerG = mat2(dFdx(vLayoutUv), dFdy(vLayoutUv)) * invGs;
    vec2 uvTrue = vUv + uvPerG * (g - vGlyphUv);
    vec2 layTrue = vLayoutUv + layPerG * (g - vGlyphUv);

    // changes per device px
    mat2 gPerDev = mat2(dFdx(g), dFdy(g));
    mat2 uvPerDev = uvPerG * gPerDev;
    mat2 layUvPerDev = layPerG * gPerDev;
    mat2 devToLay = mat2(layUvPerDev[0] * uMeshSize, layUvPerDev[1] * uMeshSize); // device px -> layout px
    mat2 layToDev = inverse2(devToLay);
    float aa = max(abs(devToLay[0].x) + abs(devToLay[1].x), 0.0001); // layout px per screen px

    // edge width of the distance field, from the unmoved glyph (moved pieces would spike it at their seams)
    vec3 msdfTrue = textureLod(uMap, uvTrue, 0.0).rgb;
    float sdWidth = max(fwidth(median(msdfTrue.r, msdfTrue.g, msdfTrue.b)), 0.00001);

    // --- find the moved piece that covers this fragment ---
    vec2 layPx = layTrue * uMeshSize;
    vec2 offDev = vec2(0.0);
    vec2 pieceId = floor(layPx / CELL_PX);
    for (int i = 0; i < 3; i++) {
        pieceId = floor((layPx - devToLay * offDev) / CELL_PX);
        offDev = pieceOffset(pieceId, fragDev, layPx, layToDev, aniIn, cursorOn, dpr) * dpr;
    }
    vec2 srcLayPx = layPx - devToLay * offDev;
    vec2 pieceMiss = abs(floor(srcLayPx / CELL_PX) - pieceId);
    float inPiece = 1.0 - step(0.5, pieceMiss.x + pieceMiss.y); // 0 = gap between moved pieces

    // where this fragment's content comes from
    vec2 gSrc = g - gPerDev * offDev;
    vec2 uvSrc = uvTrue - uvPerDev * offDev;
    vec2 srcDev = fragDev - offDev;
    float inGlyph = step(0.0, gSrc.x) * step(gSrc.x, 1.0) * step(0.0, gSrc.y) * step(gSrc.y, 1.0);

    // --- MSDF glyph ---
    vec3 msdf = textureLod(uMap, uvSrc, 0.0).rgb;
    float sd = median(msdf.r, msdf.g, msdf.b) - DISTANCE_COEF;
    float sdPx = sd / sdWidth; // signed distance to the glyph edge in screen px, > 0 inside
    float pieceMask = inGlyph * inPiece;
    float glyphAlpha = clamp(sdPx + 0.5, 0.0, 1.0) * pieceMask;
    // the outer glow reaches past the glyph edge, so only discard far outside it
    if (pieceMask <= 0.0 || sdPx < -GLOW_PX * 6.0) {
        discard;
    }

    // 1. reveal: the whole text follows uTextAniIn, the cursor is ignored
    // 2. after the reveal: inside the cursor radius the progress is pulled back towards CURSOR_CENTER_PROGRESS,
    //    so the effect plays around the cursor, outside it the text stays filled
    // trail behind the cursor - fades over time, so the progress returns to 1 behind it
    vec3 trail = sampleTrail(srcDev) * cursorOn;
    float trailStrength = pow(clamp(trail.r, 0.0, 1.0), TRAIL_FALLOFF);
    float cursorP = mix(1.0, CURSOR_CENTER_PROGRESS, max(cursorInfluence(srcDev / dpr) * cursorOn, trailStrength));
    float p = min(aniIn, cursorP);

    // --- stages ---
    float borderStage = stageProgress(p, BORDER_STAGE);
    float linesStage = stageProgress(p, LINES_STAGE);
    float fillStage = stageProgress(p, FILL_STAGE);

    // the flicker plays only during the reveal - in the cursor area the stages fade and the cells only morph (rect <-> dot)
    float steady = cursorOn;
    float borderOn = stageOn(borderStage, 1.0, steady);
    float linesOn = stageOn(linesStage, 2.0, steady);
    float fillOn = stageOn(fillStage, 3.0, steady);

    // the light (frame + lines) goes out while the fill takes over
    float lightOut = 1.0 - fillStage;

    vec3 light = uLightColor != vec3(0.0) ? uLightColor : DEFAULT_LIGHT;

    // --- 1. light frame: outline on the glyph edge + soft outer glow ---
    float outline = 1.0 - smoothstep(BORDER_PX * 0.5, BORDER_PX * 0.5 + 1.0, abs(sdPx - BORDER_PX * 0.5));
    float glow = exp(min(sdPx, 0.0) / GLOW_PX) * (1.0 - glyphAlpha) * 0.45;
    float borderA = clamp(outline + glow, 0.0, 1.0) * borderOn * lightOut * pieceMask;

    // --- 2. grayscale cells inside the glyph ---
    vec2 px = srcLayPx;
    // drag the cells against the cursor direction - layoutUv y runs down the text, screen y up
    px -= vec2(trail.g, -trail.b) * TRAIL_SMEAR_PX;
    // the streak pattern re-rolls only during the reveal - frozen after it, so the cells under the cursor don't flicker
    float frame = steady > 0.0 ? 0.0 : flickerFrame();
    float morph = smoothstep(0.0, 1.0, stageProgress(p, MORPH_STAGE));
    vec2 cell = cells(px, linesStage, frame, morph, aa);
    float linesA = cell.y * glyphAlpha * linesOn * lightOut;

    // --- 3. fill ---
    float fillA = glyphAlpha * fillOn;

    // --- compose: cells, light frame over them, fill on top ---
    vec3 color = linesA > 0.0 ? vec3(cell.x) : light;
    float alpha = linesA;

    color = mix(color, light, borderA);
    alpha = max(alpha, borderA);

    color = mix(color, uColor, fillA);
    alpha = max(alpha, fillA);

    if (alpha < uAlphaTest) {
        discard;
    }

    gl_FragColor = vec4(color, alpha);
}
