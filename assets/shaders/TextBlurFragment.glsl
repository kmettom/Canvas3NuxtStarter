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

uniform float uTextAniIn;       // 0 -> 1 animate in

// Optional - unset uniforms are 0, so the defaults below are used
uniform vec3 uLightColor;       // color of the light frame and the lines
uniform float uFlickerFps;

const float DISTANCE_COEF = 0.5;

// Stages on uTextAniIn - they overlap, so one starts flickering while the previous is still on
// 1. light frame (glyph outline + glow)  2. RGB lines inside  3. fill color
const vec2 BORDER_STAGE = vec2(0.0, 0.35);
const vec2 LINES_STAGE = vec2(0.2, 0.7);
const vec2 FILL_STAGE = vec2(0.6, 1.0);

const vec3 DEFAULT_LIGHT = vec3(0.9, 0.97, 1.0);
const float DEFAULT_FLICKER_FPS = 24.0;

const float BORDER_PX = 1.6;     // outline thickness, screen px
const float GLOW_PX = 6.0;       // outer glow falloff, screen px
const float LINE_PX = 3.0;       // width of a vertical line, CSS px
const float BAND_COUNT = 5.0;    // horizontal bands the lines are broken into
const float RGB_SHIFT_PX = 1.5;  // chromatic offset of the line channels, CSS px

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

// Vertical streaks broken into horizontal bands, like a pixel-sorted / scanned light.
// density 0..1 = how many of the streaks are lit
float lines(vec2 px, float density, float frame) {
    float col = floor(px.x / LINE_PX);

    // bands with a per-column vertical offset, so the streak ends are ragged
    float bandH = max(uMeshSize.y, 1.0) / BAND_COUNT;
    float bandY = px.y / bandH + (hash(col * 0.73 + vSeed) - 0.5) * 0.6;
    float band = floor(bandY);

    // the pattern is re-rolled only every few flicker frames, so it reads as streaks, not noise
    float slowFrame = floor(frame / 3.0);
    float lit = step(1.0 - density, hash2(vec2(col, band + slowFrame * 7.0) + vSeed));

    // brightness per streak, darker gap at the band edges
    float brightness = mix(0.35, 1.0, hash2(vec2(col * 1.3, band)));
    float bandEdge = smoothstep(0.0, 0.08, fract(bandY)) * smoothstep(1.0, 0.92, fract(bandY));

    // thin dark separation between columns
    float colEdge = smoothstep(0.0, 0.25, fract(px.x / LINE_PX));

    return lit * brightness * bandEdge * colEdge;
}

void main() {
    float p = clamp(uTextAniIn, 0.0, 1.0);

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

    // --- 2. RGB lines inside the glyph ---
    vec2 px = vLayoutUv * uMeshSize;
    float frame = flickerFrame();
    float density = linesStage;
    vec3 rgbLines = vec3(
            lines(px + vec2(RGB_SHIFT_PX, 0.0), density, frame),
            lines(px, density, frame),
            lines(px - vec2(RGB_SHIFT_PX, 0.0), density, frame)
    );
    vec3 linesCol = rgbLines * light;
    float linesA = max(max(rgbLines.r, rgbLines.g), rgbLines.b) * glyphAlpha * linesOn * lightOut;

    // --- 3. fill ---
    float fillA = glyphAlpha * fillOn;

    // --- compose: lines, light frame over them, fill on top ---
    vec3 color = linesA > 0.0 ? linesCol / max(max(max(rgbLines.r, rgbLines.g), rgbLines.b), 0.0001) : light;
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
