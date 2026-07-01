uniform float uTime;
uniform float uHover;
uniform float uAniIn;
varying float vNoise;
varying vec2 vUv;

void main() {
  vec3 newposition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newposition, 1.0);
}

