precision highp float;

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

// Grid of cells grouped into vertical streaks broken into horizontal bands, like a pixel-sorted / scanned light.
// density 0..1 = how many of the streaks are lit
// morph   0..1 = circle (DOT_RADIUS_PX) -> rectangle filling the whole cell (gaps closed)
// returns x = gray level (0 black .. 1 white), y = coverage
vec2 cells(vec2 px, float density, float frame, float morph) {
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

    float aa = max(fwidth(px.x), 0.0001); // CSS px per screen px
    float shape = clamp(0.5 - d / aa, 0.0, 1.0);

    return vec2(level, lit * shape);
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
    float cursorOn = stageProgress(aniIn, CURSOR_ENABLE_STAGE);
    float cursorP = mix(1.0, CURSOR_CENTER_PROGRESS, cursorInfluence() * cursorOn);
    float p = min(aniIn, cursorP);

    // --- MSDF glyph ---
    vec3 msdf = texture2D(uMap, vUv).rgb;
    float sd = median(msdf.r, msdf.g, msdf.b) - DISTANCE_COEF;
    float sdWidth = max(fwidth(sd), 0.00001);
    float sdPx = sd / sdWidth; // signed distance to the glyph edge in screen px, > 0 inside
    float glyphAlpha = clamp(sdPx + 0.5, 0.0, 1.0);

    // --- stages ---
    float borderStage = stageProgress(p, BORDER_STAGE);
    float linesStage = stageProgress(p, LINES_STAGE);
    float fillStage = stageProgress(p, FILL_STAGE);

    float borderOn = flicker(borderStage, 1.0);
    float linesOn = flicker(linesStage, 2.0);
    float fillOn = flicker(fillStage, 3.0);

    // the light (frame + lines) goes out while the fill takes over
    float lightOut = 1.0 - fillStage;

    vec3 light = uLightColor != vec3(0.0) ? uLightColor : DEFAULT_LIGHT;

    // --- 1. light frame: outline on the glyph edge + soft outer glow ---
    float outline = 1.0 - smoothstep(BORDER_PX * 0.5, BORDER_PX * 0.5 + 1.0, abs(sdPx - BORDER_PX * 0.5));
    float glow = exp(min(sdPx, 0.0) / GLOW_PX) * (1.0 - glyphAlpha) * 0.45;
    float borderA = clamp(outline + glow, 0.0, 1.0) * borderOn * lightOut;

    // --- 2. grayscale cells inside the glyph ---
    vec2 px = vLayoutUv * uMeshSize;
    float frame = flickerFrame();
    float morph = smoothstep(0.0, 1.0, stageProgress(p, MORPH_STAGE));
    vec2 cell = cells(px, linesStage, frame, morph);
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
