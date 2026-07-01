varying float vNoise;
varying vec2 vUv;
uniform sampler2D uImage;

uniform float uTime;
uniform float uHover;
uniform float uAniIn;
uniform float uImageGallery;
uniform float uImageGalleryActive;

uniform float scale; // = 4.0
uniform float smoothness; // = 0.01
uniform float seed; // = 12.9898

uniform vec2 uMeshSize; // The size of the mesh (width, height)
uniform vec2 uTextureSize; // The size of the texture (width, height)

void main() {
  vec2 uv = vUv;
  uv.x = fract(uv.x + uTime * 0.05); // wrap horizontally
  uv.x = fract(uv.x + uTime * 0.05);
  gl_FragColor = texture2D(uImage, uv);
}
