varying vec2 vUv;
uniform float scrollSpeed;

void main() {
  vec3 newposition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newposition, 1.0);
}
