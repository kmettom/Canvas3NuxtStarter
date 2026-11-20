// Basic MSDF text vertex - the CRT look is all in TextCRTGFragment.glsl
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
