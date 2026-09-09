uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform float uScrollSpeed; // 0–1 from JS

void main(){
    vec2 newUV = vUv;

    float distFromEdge = min(vUv.y, 1.0 - vUv.y) * 1.0;
    float area = smoothstep(0.9, 0.0, distFromEdge);
    area = pow(area, 8.0);

    float scrollIntensity = 0.125 * uScrollSpeed;
    float finalIntensity = 0.035 + scrollIntensity;
    newUV.x -= (vUv.x - 0.5) * finalIntensity * area;

    gl_FragColor = texture2D(tDiffuse, newUV);
}
