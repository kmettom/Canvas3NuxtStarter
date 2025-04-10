uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform float scrollSpeed;
void main() {
  vec2 newUV = vUv;
  gl_FragColor = texture2D(tDiffuse, newUV);
}
