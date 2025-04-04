
uniform float time;
uniform vec2 hover;
uniform float hoverState;
uniform float aniIn;
varying float vNoise;
varying vec2 vUv;

void main() {
  vec3 newposition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newposition, 1. );
}
