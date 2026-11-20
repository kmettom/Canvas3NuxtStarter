precision highp float;

// Green CRT dot-matrix text - https://www.shadertoy.com/view/MlsGDs masked by the MSDF glyph
// The pattern is anchored to the text element (scrolls with it), with the dot size of the screen-space original.
// uTextAniIn 0 -> 1 lowers the dot threshold, so the dots grow out of the pattern - at 1 it is the original look.

varying vec2 vUv;
varying vec2 vLayoutUv;         // 0..1 across the text element

uniform sampler2D uMap;
uniform float uTime;
uniform vec2 uViewport;         // CSS px
uniform vec2 uMeshSize;         // text element size, CSS px
uniform float uTextAniIn;       // 0 -> 1 animate in
uniform vec2 uMouse;            // viewport 0..1, y from the top (set by Canvas3)
uniform float uDevicePixelRatio;

// Trail simulation (canvas3-options simulations.trail) - set by Canvas3, declaring them turns the simulation on
// r = trail intensity 0..1, gb = cursor direction there (screen space)
uniform sampler2D uSimTrail;
uniform vec2 uSimTrailResolution; // drawing buffer, device px - gl_FragCoord / this = screen uv

const float DISTANCE_COEF = 0.5;
const vec2 REVEAL_RANGE = vec2(-1.4, 0.0); // dot threshold offset at uTextAniIn 0 (no dots) -> 1 (original)
// cell intensity: x = weakest cell, y = strongest cell. 0.1 = only the center dot, 0.6 = full cell
// (the original is about -0.9..1.27, below 0.1 the cell is blank)
const vec2 INTENSITY_RANGE = vec2(0.01, 0.99);
const float ELEMENT_OFFSET = 10.0;         // how far apart (in pattern space) the elements' patterns start, 0 = all the same
// uTextAniIn from which every cell keeps at least its center dot (no blank cells) - 0 = as soon as the reveal starts
const float MIN_DOT_FROM = 0.0;

// speed of the flowing waves in the pattern - 1 = the original, 0.5 = half as fast
const float PATTERN_SPEED = 0.3;

// Trail - the existing pattern gets more intense along the cursor trail (strongest in the middle of the trail),
// and blends back into the normal pattern as the trail fades (FADE in trailSimulation.glsl, ~1 s)
const float TRAIL_INTENSITY = 1.5; // pattern boost at full trail - intensity * (1 + this), 0 = off
const float TRAIL_FALLOFF = 2.0;   // > 1 = only the middle / fresh part of the trail boosts, < 1 = the whole trail

// Cursor - inside the radius the pattern goes down to INTENSITY_RANGE.x (fewest dots) at the cursor,
// blending back into the pattern towards the edge of the radius
const float CURSOR_RADIUS_PX = 75.0; // CSS px
const float CURSOR_FALLOFF = 1.0;     // > 1 = tighter center, < 1 = wider low area

float time;   // iTime / 3 * PATTERN_SPEED, set in main
float trailAmount;  // 0..1 trail at this fragment, set in main
float cursorAmount; // 0..1 cursor influence at this fragment, set in main
float reveal; // threshold offset from uTextAniIn, set in main
float minDotOn; // 1 = every cell shows at least its center dot, set in main

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float hash(float n) {
    return fract(sin(n * 127.1) * 43758.5453123);
}

float noise(vec2 p) {
    return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time / 11.0))) + 0.2;
}

mat2 rotate(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float fbm(vec2 p) {
    p *= 1.1;
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 3; i++) {
        mat2 modify = rotate(time / 50.0 * float(i * i));
        f += amp * noise(p);
        p = modify * p;
        p *= 2.0;
        amp /= 2.2;
    }
    return f;
}

float pattern(vec2 p) {
    vec2 q = vec2(fbm(p + vec2(1.0)), fbm(rotate(0.1 * time) * p + vec2(1.0)));
    vec2 r = vec2(fbm(rotate(0.1) * q), fbm(q));
    return fbm(p + r);
}

float digit(vec2 p) {
    vec2 grid = vec2(3.0, 1.0) * 40.0;
    vec2 s = floor(p * grid) / grid;
    p = p * grid;
    // pattern() is about -0.66..1.0 - remap it to INTENSITY_RANGE; x > 0.1 = no blank cells, the shapes stay the same
    float intensity = mix(INTENSITY_RANGE.x, INTENSITY_RANGE.y, (pattern(s / 10.0) + 0.66) / 1.66);
    // trail - the same pattern, more intense
    intensity *= 1.0 - trailAmount * TRAIL_INTENSITY;
    // cursor - down to the weakest cell at the cursor
    intensity = mix(intensity, INTENSITY_RANGE.x, cursorAmount);
    p = fract(p);
    p *= vec2(1.2, 1.2);
    float x = fract(p.x * 5.0);
    float y = fract((1.0 - p.y) * 5.0);
    int i = int(floor((1.0 - p.y) * 5.0));
    int j = int(floor(p.x * 5.0));
    int n = (i - 2) * (i - 2) + (j - 2) * (j - 2);
    float f = float(n) / 16.0;
    float isOn = intensity + reveal - f > 0.1 ? 1.0 : 0.0;
    // minimum size - the center dot (the smallest a cell can show) is always on, so no cell is blank
    //    if (n == 0) isOn = max(isOn, minDotOn);
    return p.x <= 1.0 && p.y <= 1.0 ? isOn * (0.2 + y * 4.0 / 5.0) * (0.75 + x / 4.0) : 0.0;
}

float onOff(float a, float b, float c) {
    return step(c, sin(uTime + a * cos(uTime * b)));
}

vec3 getColor(vec2 p) {
    // the scan bar keeps its original speed, only the pattern waves follow PATTERN_SPEED
    float bar = mod(p.y + uTime / 3.0 * 20.0, 1.0) < 0.2 ? 1.4 : 1.0;
    float middle = 0.0;
    float off = 0.002;
    float sum = 0.0;
    for (float i = -1.0; i < 2.0; i += 1.0) {
        for (float j = -1.0; j < 2.0; j += 1.0) {
            float d = digit(p + vec2(off * i, off * j));
            sum += d;
            if (i == 0.0 && j == 0.0) middle = d;
        }
    }
    vec3 color = vec3(0.8, 0.8, 0.8);
    return vec3(0.9) * middle + sum / 10.0 * color * bar;
}

void main() {
    time = uTime / 3.0 * PATTERN_SPEED;
    reveal = mix(REVEAL_RANGE.x, REVEAL_RANGE.y, clamp(uTextAniIn, 0.0, 1.0));
    minDotOn = uTextAniIn > MIN_DOT_FROM ? 1.0 : 0.0;

    // --- trail + cursor at this fragment, both scaled in with uTextAniIn ---
    float aniIn = clamp(uTextAniIn, 0.0, 1.0);
    float trail = texture2D(uSimTrail, gl_FragCoord.xy / max(uSimTrailResolution, vec2(1.0))).r;
    trailAmount = pow(clamp(trail, 0.0, 1.0), TRAIL_FALLOFF) * aniIn;

    float dpr = uDevicePixelRatio > 0.0 ? uDevicePixelRatio : 1.0;
    vec2 cursorPx = vec2(uMouse.x, 1.0 - uMouse.y) * uViewport;
    float cursorDist = distance(gl_FragCoord.xy / dpr, cursorPx);
    cursorAmount = pow(1.0 - smoothstep(0.1, CURSOR_RADIUS_PX, cursorDist), CURSOR_FALLOFF) * aniIn;

    // --- MSDF glyph ---
    vec3 msdf = texture2D(uMap, vUv).rgb;
    float sd = median(msdf.r, msdf.g, msdf.b) - DISTANCE_COEF;
    float glyphAlpha = clamp(sd / max(fwidth(sd), 0.00001) + 0.5, 0.0, 1.0);
    if (glyphAlpha <= 0.0) {
        discard;
    }

    // --- CRT pattern, anchored to the element (scrolls with it) ---
    // element px / viewport keeps the dot size of the screen-space original
    vec2 viewport = max(uViewport, vec2(1.0));
    vec2 p = vLayoutUv * uMeshSize / viewport;
    // per-element offset, so each text shows a different part of the pattern
    // (from the element size - stable on scroll; elements of the exact same size share it)
    p += vec2(hash(uMeshSize.x * 0.731 + uMeshSize.y * 1.37), hash(uMeshSize.y * 0.913 + uMeshSize.x * 0.29)) * ELEMENT_OFFSET;
    vec3 col = getColor(p);

    // the original is drawn on black - brightness becomes alpha, so it reads the same over any background
    float brightness = max(max(col.r, col.g), col.b);
    float alpha = clamp(brightness, 0.0, 1.0) * glyphAlpha;
    if (alpha <= 0.001) {
        discard;
    }

    gl_FragColor = vec4(col / max(brightness, 0.0001), alpha);
}
