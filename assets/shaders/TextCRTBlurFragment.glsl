precision highp float;

// Dot-matrix CRT text (pattern based on https://www.shadertoy.com/view/MlsGDs)
// The glyph is built from cells of 5x5 dots. A flowing fbm pattern sets how many dots each cell lights,
// so the font grows out of the pattern, then the solid fill takes over.
// The glyph is also cut into pieces along the same cells - each piece is moved on its own
// (misalign while the effect plays, pull towards the cursor, drag along the trail), which deforms the letters.
// Previous version (flickering grayscale cells): TextBlurFragmentCRTCells.glsl

varying vec2 vUv;               // stretched over the expanded quad - see TextCRTBlurVertex.glsl
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

const float DISTANCE_COEF = 0.5;

// Stages on uTextAniIn
// 1. dots grow out of the pattern  2. fill color takes over
const vec2 PATTERN_STAGE = vec2(0.0, 0.75);
const vec2 FILL_STAGE = vec2(0.6, 1.0);
// pattern threshold offset over PATTERN_STAGE: x = no dots lit, y = all dots lit
const vec2 REVEAL_RANGE = vec2(-1.4, 1.6);

// Sweep - uTextAniIn runs across the text instead of everywhere at once
// KEEP IN SYNC with SWEEP_DIR / SWEEP_WIDTH in TextCRTBlurVertex.glsl
// direction in layoutUv space: (1,0) left -> right, (-1,0) right -> left, (0,1) / (0,-1) vertical
// (if a vertical one runs the wrong way, flip its sign), diagonals like (1,1) work too
const vec2 SWEEP_DIR = vec2(1.0, 0.0);
const float SWEEP_WIDTH = 0.6;   // soft edge of the sweep front, fraction of the text size

// Dot matrix
const float DOTS_PER_CELL = 5.0;    // dots per cell side
const float DOT_PITCH_PX = 3.0;     // distance between dot centers, CSS px
const float DOT_RADIUS_PX = 1.0;    // dot radius, CSS px
const float CELL_GAP = 1.2;         // > 1 leaves an empty gap between cells (1.2 = one sixth of the cell)
const float CELL_PX = DOT_PITCH_PX * DOTS_PER_CELL * CELL_GAP;
const float GLOW_PX = 1.2;          // soft halo around each dot, CSS px
const float GLOW_STRENGTH = 0.35;
const float GLOW_GRAY = 1.0;        // gray level of the halo (1 = white)

// Pattern
const float PATTERN_CELL_STEP = 0.004; // pattern space per cell - higher = smaller, busier pattern
const float TIME_SCALE = 1.0 / 3.0;    // pattern flow speed

// Wave - a horizontal sine displacement inside a band that rolls down the text
const float WAVE_AMP_PX = 4.0;
const float WAVE_FREQ = 0.08;          // per CSS px
const float WAVE_SPEED = 1.0;
const float WAVE_ROLL_SPEED = 0.25;    // text heights per second
const float WAVE_WINDOW = 50.0;        // higher = narrower band

// Scan bar - brighter horizontal stripes rolling down
const float BAR_PX = 24.0;
const float BAR_SPEED = 0.5;           // bars per second
const float BAR_BOOST = 1.4;

// Cursor reveal - inside the radius the progress is pulled back, so the effect plays around the cursor
const float CURSOR_RADIUS_PX = 50.0; // CSS px
const float CURSOR_FALLOFF = 1.05;    // > 1 = tighter center, < 1 = wider affected area (~0 = flat over the whole radius)
const float CURSOR_CENTER_PROGRESS = 0.35; // progress right under the cursor (0.15 = the effect goes 85% of the way back)
// inside the cursor radius, dots this close to their cell center stay lit no matter the pattern,
// so the text never goes fully dark (0 = only the center dot, 0.07 = center + 4 neighbours, < 0 = off)
const float CURSOR_MIN_DOT_F = 0.0;
// the cursor has no effect during the reveal, it fades in over this range of uTextAniIn at the very end
const vec2 CURSOR_ENABLE_STAGE = vec2(0.95, 1.0);

// Trail - the cursor path pulls the progress back towards CURSOR_CENTER_PROGRESS like the cursor radius, so the effect
// plays along the trail and the text fills back in as the trail fades. Fades in with the cursor (CURSOR_ENABLE_STAGE).
const float TRAIL_FALLOFF = 1.5;   // > 1 = only the fresh part of the trail goes far back, < 1 = the whole trail
const float TRAIL_SMEAR_PX = 10.0; // the dot grid is dragged along the cursor direction, CSS px

// Deform - the glyph is cut into pieces of CELL_PX (the dot cells) and every piece is moved on its own
// KEEP IN SYNC: DEFORM_PAD_PX in TextCRTBlurVertex.glsl must be >= the largest offset
// (PULL_MAX_PX + length(MISALIGN_PX) + TRAIL_DRAG_PX), anything further is cut off at the quad edge
const float DEFORM_PAD_PX = 40.0;
const vec2 MISALIGN_PX = vec2(5.0, 3.0); // piece wobble while the effect plays on it (scaled by 1 - progress), CSS px
const float MISALIGN_SPEED = 1.5;
const float PULL_STRENGTH = 0.25;        // pieces in the cursor radius move this fraction of their distance to the cursor
const float PULL_MAX_PX = 25.0;          // max pull, CSS px
const float TRAIL_DRAG_PX = 8.0;         // pieces on the trail are dragged along the cursor direction, CSS px
const float TRAIL_PULL = 1.0;            // pieces on the trail are pulled towards the cursor too (0 = off, 1 = as strong as the radius)

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
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

// local progress of a point on the text: 0 before the sweep front reaches it, 1 once it has passed
float sweepProgress(float p, vec2 layoutUv) {
    vec2 dir = SWEEP_DIR;
    float s = dot(layoutUv - 0.5, dir) / max(abs(dir.x) + abs(dir.y), 0.0001) + 0.5; // 0 = start side, 1 = end side
    return clamp((p * (1.0 + SWEEP_WIDTH) - s) / SWEEP_WIDTH, 0.0, 1.0);
}

// --- flowing pattern ---

mat2 rotate(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

float noise(vec2 p, float t) {
    return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(t / 11.0))) + 0.2;
}

float fbm(vec2 p, float t) {
    p *= 1.1;
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
        f += amp * noise(p, t);
        p = rotate(t / 50.0 * float(i * i)) * p;
        p *= 2.0;
        amp /= 2.2;
    }
    return f;
}

float pattern(vec2 p, float t) {
    vec2 q = vec2(fbm(p + vec2(1.0), t), fbm(rotate(0.1 * t) * p + vec2(1.0), t));
    vec2 r = vec2(fbm(rotate(0.1) * q, t), fbm(q, t));
    return fbm(p + r, t);
}

// --- dot matrix ---
// returns x = gray level, y = coverage
// minDotF: dots with f <= minDotF are always lit (pass < 0 to disable)
vec2 dotMatrix(vec2 px, float t, float reveal, float aa, float minDotF) {
    vec2 cellId = floor(px / CELL_PX);
    vec2 cellUv = fract(px / CELL_PX) * CELL_GAP; // 0..CELL_GAP, dots live in 0..1
    float inCell = step(cellUv.x, 1.0) * step(cellUv.y, 1.0);

    // one pattern value per cell
    float intensity = pattern(cellId * PATTERN_CELL_STEP, t) * 1.3 - 0.03;

    vec2 dotUv = cellUv * DOTS_PER_CELL;
    vec2 dotId = floor(dotUv);
    vec2 dotFract = fract(dotUv);

    // dots light up from the cell center outwards as intensity + reveal grows
    float center = (DOTS_PER_CELL - 1.0) * 0.5;
    vec2 fromCenter = dotId - center;
    float f = dot(fromCenter, fromCenter) / max(4.0 * center * center, 1.0);
    float on = smoothstep(0.1, 0.18, intensity + reveal - f);
    on = max(on, step(f, minDotF));

    // brightness gradient inside each dot, like the reference
    float brightness = (0.2 + dotFract.y * 0.8) * (0.75 + dotFract.x * 0.25);

    // round dot + soft halo
    float d = length((dotFract - 0.5) * DOT_PITCH_PX) - DOT_RADIUS_PX;
    float core = clamp(0.5 - d / aa, 0.0, 1.0);
    float glow = exp(-max(d, 0.0) / GLOW_PX) * GLOW_STRENGTH;

    float gray = mix(GLOW_GRAY, brightness * 0.9, core);
    return vec2(gray, max(core, glow) * on * inCell);
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

    // same progress as the dots use, at the piece center
    float influence = cursorInfluence(centerCss) * cursorOn;
    vec3 trail = sampleTrail(centerDev) * cursorOn;
    float trailStrength = pow(clamp(trail.r, 0.0, 1.0), TRAIL_FALLOFF);
    float cursorP = mix(1.0, CURSOR_CENTER_PROGRESS, max(influence, trailStrength));
    float effect = 1.0 - min(sweepProgress(aniIn, centerLay / max(uMeshSize, vec2(1.0))), cursorP);

    // misalign - smooth wobble per piece
    float seed = hash2(cellId);
    float t = uTime * MISALIGN_SPEED;
    vec2 offset = vec2(sin(t + seed * 31.0), sin(t * 1.3 + seed * 17.0 + 1.7)) * MISALIGN_PX * effect;

    // pull towards the cursor - inside the radius and along the fading trail (capped by PULL_MAX_PX, so far trail
    // pieces lean towards the cursor rather than jump to it)
    vec2 toCursor = vec2(uMouse.x, 1.0 - uMouse.y) * uViewport - centerCss;
    float pullAmount = max(influence, trailStrength * TRAIL_PULL);
    vec2 pull = toCursor * PULL_STRENGTH * pullAmount;
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
    vec2 cellId = floor(layPx / CELL_PX);
    for (int i = 0; i < 3; i++) {
        cellId = floor((layPx - devToLay * offDev) / CELL_PX);
        offDev = pieceOffset(cellId, fragDev, layPx, layToDev, aniIn, cursorOn, dpr) * dpr;
    }
    vec2 srcLayPx = layPx - devToLay * offDev;
    vec2 cellMiss = abs(floor(srcLayPx / CELL_PX) - cellId);
    float inPiece = 1.0 - step(0.5, cellMiss.x + cellMiss.y); // 0 = gap between moved pieces

    // where this fragment's content comes from
    vec2 gSrc = g - gPerDev * offDev;
    vec2 uvSrc = uvTrue - uvPerDev * offDev;
    vec2 laySrc = srcLayPx / max(uMeshSize, vec2(1.0));
    vec2 srcDev = fragDev - offDev;
    float inGlyph = step(0.0, gSrc.x) * step(gSrc.x, 1.0) * step(0.0, gSrc.y) * step(gSrc.y, 1.0);

    // --- MSDF glyph ---
    vec3 msdf = textureLod(uMap, uvSrc, 0.0).rgb;
    float sd = median(msdf.r, msdf.g, msdf.b) - DISTANCE_COEF;
    float glyphAlpha = clamp(sd / sdWidth + 0.5, 0.0, 1.0) * inGlyph * inPiece;
    if (glyphAlpha <= 0.0) {
        discard;
    }

    // 1. reveal: the whole text follows uTextAniIn, the cursor is ignored
    // 2. after the reveal: inside the cursor radius the progress is pulled back towards CURSOR_CENTER_PROGRESS,
    //    so the effect plays around the cursor, outside it the text stays filled
    float localAniIn = sweepProgress(aniIn, laySrc); // the reveal travels along SWEEP_DIR
    float cursorStrength = cursorInfluence(srcDev / dpr) * cursorOn;
    // trail behind the cursor - fades over time, so the progress returns to 1 behind it
    vec3 trail = sampleTrail(srcDev) * cursorOn;
    float trailStrength = pow(clamp(trail.r, 0.0, 1.0), TRAIL_FALLOFF);
    float cursorP = mix(1.0, CURSOR_CENTER_PROGRESS, max(cursorStrength, trailStrength));
    float p = min(localAniIn, cursorP);

    // --- stages ---
    float patternStage = stageProgress(p, PATTERN_STAGE);
    float fillStage = stageProgress(p, FILL_STAGE);

    // --- wave displacement of the dot grid ---
    vec2 px = srcLayPx;

    float waveY = px.y / max(uMeshSize.y, 1.0) - mod(uTime * WAVE_ROLL_SPEED, 1.0);
    float waveWindow = 1.0 / (1.0 + WAVE_WINDOW * waveY * waveY);
    px.x += sin(px.y * WAVE_FREQ + uTime * WAVE_SPEED) * WAVE_AMP_PX * waveWindow;
    // drag the dots against the cursor direction - layoutUv y runs down the text, screen y up
    px -= vec2(trail.g, -trail.b) * TRAIL_SMEAR_PX;

    // --- dots ---
    float reveal = mix(REVEAL_RANGE.x, REVEAL_RANGE.y, patternStage);
    float minDotF = max(cursorStrength, trailStrength) > 0.0 ? CURSOR_MIN_DOT_F : -1.0;
    vec2 dots = dotMatrix(px, uTime * TIME_SCALE, reveal, aa, minDotF);

    float bar = mod(px.y / BAR_PX + uTime * BAR_SPEED, 1.0) < 0.2 ? BAR_BOOST : 1.0;
    float dotsA = dots.y * glyphAlpha * (1.0 - fillStage);

    // --- fill ---
    float fillA = glyphAlpha * fillStage;

    // --- compose ---
    vec3 color = vec3(min(dots.x * bar, 1.0));
    float alpha = dotsA;

    color = mix(color, uColor, fillA);
    alpha = max(alpha, fillA);

    if (alpha < uAlphaTest) {
        discard;
    }

    gl_FragColor = vec4(color, alpha);
}
