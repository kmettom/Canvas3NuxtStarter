precision highp float;

// Dot-matrix CRT text (pattern based on https://www.shadertoy.com/view/MlsGDs)
// The glyph is built from cells of 5x5 dots. A flowing fbm pattern sets how many dots each cell lights,
// so the font grows out of the pattern, then the solid fill takes over.
// Previous version (flickering grayscale cells): TextBlurFragmentCRTCells.glsl

varying vec2 vUv;
varying vec2 vLayoutUv;
varying vec2 vGlyphUv;
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

const float DISTANCE_COEF = 0.5;

// Stages on uTextAniIn
// 1. dots grow out of the pattern  2. fill color takes over
const vec2 PATTERN_STAGE = vec2(0.0, 0.75);
const vec2 FILL_STAGE = vec2(0.6, 1.0);
// pattern threshold offset over PATTERN_STAGE: x = no dots lit, y = all dots lit
const vec2 REVEAL_RANGE = vec2(-1.4, 1.6);

// Sweep - uTextAniIn runs across the text instead of everywhere at once
// KEEP IN SYNC with SWEEP_DIR / SWEEP_WIDTH in TextBlurVertex.glsl
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
const float CURSOR_RADIUS_PX = 150.0; // CSS px
const float CURSOR_FALLOFF = 1.05;    // > 1 = tighter center, < 1 = wider affected area (~0 = flat over the whole radius)
const float CURSOR_CENTER_PROGRESS = 0.35; // progress right under the cursor (0.15 = the effect goes 85% of the way back)
// inside the cursor radius, dots this close to their cell center stay lit no matter the pattern,
// so the text never goes fully dark (0 = only the center dot, 0.07 = center + 4 neighbours, < 0 = off)
const float CURSOR_MIN_DOT_F = 0.0;
// the cursor has no effect during the reveal, it fades in over this range of uTextAniIn at the very end
const vec2 CURSOR_ENABLE_STAGE = vec2(0.95, 1.0);

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float stageProgress(float p, vec2 stage) {
    return clamp((p - stage.x) / (stage.y - stage.x), 0.0, 1.0);
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
float cursorInfluence() {
    float dpr = uDevicePixelRatio > 0.0 ? uDevicePixelRatio : 1.0;
    vec2 fragPx = gl_FragCoord.xy / dpr;
    vec2 cursorPx = vec2(uMouse.x, 1.0 - uMouse.y) * uViewport;
    float t = 1.0 - smoothstep(0.0, CURSOR_RADIUS_PX, distance(fragPx, cursorPx));
    return pow(t, CURSOR_FALLOFF);
}

void main() {
    // 1. reveal: the whole text follows uTextAniIn, the cursor is ignored
    // 2. after the reveal: inside the cursor radius the progress is pulled back towards CURSOR_CENTER_PROGRESS,
    //    so the effect plays around the cursor, outside it the text stays filled
    float aniIn = clamp(uTextAniIn, 0.0, 1.0);
    float localAniIn = sweepProgress(aniIn, vLayoutUv); // the reveal travels along SWEEP_DIR
    float cursorOn = stageProgress(aniIn, CURSOR_ENABLE_STAGE);
    float cursorStrength = cursorInfluence() * cursorOn;
    float cursorP = mix(1.0, CURSOR_CENTER_PROGRESS, cursorStrength);
    float p = min(localAniIn, cursorP);

    // --- MSDF glyph ---
    vec3 msdf = texture2D(uMap, vUv).rgb;
    float sd = median(msdf.r, msdf.g, msdf.b) - DISTANCE_COEF;
    float sdWidth = max(fwidth(sd), 0.00001);
    float glyphAlpha = clamp(sd / sdWidth + 0.5, 0.0, 1.0);

    // --- stages ---
    float patternStage = stageProgress(p, PATTERN_STAGE);
    float fillStage = stageProgress(p, FILL_STAGE);

    // --- wave displacement of the dot grid ---
    vec2 px = vLayoutUv * uMeshSize;
    float aa = max(fwidth(px.x), 0.0001); // CSS px per screen px, taken before the displacement

    float waveY = px.y / max(uMeshSize.y, 1.0) - mod(uTime * WAVE_ROLL_SPEED, 1.0);
    float waveWindow = 1.0 / (1.0 + WAVE_WINDOW * waveY * waveY);
    px.x += sin(px.y * WAVE_FREQ + uTime * WAVE_SPEED) * WAVE_AMP_PX * waveWindow;

    // --- dots ---
    float reveal = mix(REVEAL_RANGE.x, REVEAL_RANGE.y, patternStage);
    float minDotF = cursorStrength > 0.0 ? CURSOR_MIN_DOT_F : -1.0;
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
