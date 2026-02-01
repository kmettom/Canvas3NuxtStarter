uniform float uTime;
uniform float uHover;
uniform float uAniIn;
varying float vNoise;
varying vec2 vUv;

void main() {
  vUv = uv; // Capture UV

  //  vUv = uv + vec2(uTime * 0.05, 0.0); // adjust speed
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

