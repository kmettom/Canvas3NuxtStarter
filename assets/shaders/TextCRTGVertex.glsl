// Basic MSDF text vertex - the CRT look is all in TextCRTGFragment.glsl
attribute vec2 layoutUv;        // 0..1 across the whole text element (three-msdf-text-utils)

varying vec2 vUv;
varying vec2 vLayoutUv;

void main() {
    vUv = uv;
    vLayoutUv = layoutUv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
