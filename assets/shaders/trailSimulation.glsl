precision highp float;

// Cursor trail - a fading brush stroke along the cursor path (Canvas3 `simulations.trail`)
// state: r = trail intensity 0..1, gb = direction the cursor moved there (screen space, -1..1), faded with r
// Read in mesh shaders as `uniform sampler2D uSimTrail;`

varying vec2 vUv;       // this texel, 0..1 of the viewport, bottom-left origin
varying vec2 vPrevUv;   // where to read the previous state (already shifted by the scroll)

uniform sampler2D uState;
uniform vec2 uTexel;        // 1 / simulation size
uniform vec2 uResolution;   // viewport, CSS px
uniform vec2 uMouse;        // cursor at the end of this step, uv
uniform vec2 uMousePrev;    // cursor at the start of this step, uv
uniform float uMouseSpeed;  // CSS px moved during this step
uniform float uMouseActive; // 1 while the cursor is over the page

const float FADE = 0.97;           // per 60 Hz step - higher = longer trail (0.97 ~ 1 s)
const float SPREAD = 0.15;         // 0..1 blur with the neighbours per step - softens and widens the trail as it fades
const float RADIUS_PX = 100.0;     // brush radius, CSS px
const float MIN_SPEED_PX = 0.5;    // px per step - below it the cursor counts as standing still (no new trail)
const float FULL_SPEED_PX = 6.0;   // px per step for the full brush

// distance from p to the segment a-b
float segmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

// outside the viewport there is no trail - content scrolled in from the edge starts clean
vec3 readState(vec2 uv) {
    vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    return texture2D(uState, uv).rgb * inside.x * inside.y;
}

void main() {
    vec3 state = readState(vPrevUv);
    vec3 neighbours = (
    readState(vPrevUv + vec2(uTexel.x, 0.0))
    + readState(vPrevUv - vec2(uTexel.x, 0.0))
    + readState(vPrevUv + vec2(0.0, uTexel.y))
    + readState(vPrevUv - vec2(0.0, uTexel.y))
    ) * 0.25;
    state = mix(state, neighbours, SPREAD) * FADE;

    // brush along the cursor path of this step - no gaps when the cursor moves fast
    vec2 from = uMousePrev * uResolution;
    vec2 to = uMouse * uResolution;
    float d = segmentDistance(vUv * uResolution, from, to);
    float speed = smoothstep(MIN_SPEED_PX, FULL_SPEED_PX, uMouseSpeed) * uMouseActive;
    float brush = (1.0 - smoothstep(0.0, RADIUS_PX, d)) * speed;

    // the trail keeps its strongest value - repeated strokes don't blow up past 1
    vec2 direction = length(to - from) > 0.0001 ? normalize(to - from) : vec2(0.0);
    float intensity = max(state.r, brush);
    vec2 flow = mix(state.gb, direction * intensity, step(state.r, brush));

    gl_FragColor = vec4(clamp(intensity, 0.0, 1.0), flow, 1.0);
}
