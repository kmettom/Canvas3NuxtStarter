precision highp float;

// Water ripples - classic 2D wave equation on a ping-pong texture (Canvas3 `simulations.ripples`)
// state: r = height now, g = height one step before
// Read in mesh shaders as `uniform sampler2D uSimRipples;` - the slope (gradient of r) is what distorts / lights things

varying vec2 vUv;       // this texel, 0..1 of the viewport, bottom-left origin
varying vec2 vPrevUv;   // where to read the previous state (already shifted by the scroll)

uniform sampler2D uState;
uniform vec2 uTexel;        // 1 / simulation size
uniform vec2 uResolution;   // viewport, CSS px
uniform vec2 uMouse;        // cursor at the end of this step, uv
uniform vec2 uMousePrev;    // cursor at the start of this step, uv
uniform float uMouseSpeed;  // CSS px moved during this step
uniform float uMouseActive; // 1 while the cursor is over the page

const float DAMPING = 0.985;          // 0.97 - 0.995, higher = longer trail
const float RADIUS_PX = 40.0;         // brush radius, CSS px
const float STRENGTH = 0.25;          // push per step at full speed
const float FULL_SPEED_PX = 12.0;     // px per step for the full push - a slow cursor makes small waves
const float MAX_HEIGHT = 1.0;

// distance from p to the segment a-b
float segmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

// outside the viewport the water is flat - content scrolled in from the edge starts calm
vec2 readState(vec2 uv) {
    vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    return texture2D(uState, uv).rg * inside.x * inside.y;
}

void main() {
    vec2 state = readState(vPrevUv);
    float neighbours = readState(vPrevUv + vec2(uTexel.x, 0.0)).r
    + readState(vPrevUv - vec2(uTexel.x, 0.0)).r
    + readState(vPrevUv + vec2(0.0, uTexel.y)).r
    + readState(vPrevUv - vec2(0.0, uTexel.y)).r;

    // new = average of the neighbours * 2 - previous, then damped
    float height = (neighbours * 0.5 - state.g) * DAMPING;

    // push the water along the cursor path of this step - no gaps when the cursor moves fast
    float d = segmentDistance(vUv * uResolution, uMousePrev * uResolution, uMouse * uResolution);
    float brush = 1.0 - smoothstep(0.0, RADIUS_PX, d);
    height += brush * STRENGTH * min(uMouseSpeed / FULL_SPEED_PX, 1.0) * uMouseActive;

    height = clamp(height, -MAX_HEIGHT, MAX_HEIGHT);
    gl_FragColor = vec4(height, state.r, 0.0, 1.0);
}
