uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform float scrollSpeed; // 0–1 from JS

void main(){
    vec2 newUV = vUv;

    // Ease: slow start, faster end
    //    float t = clamp(scrollSpeed / 0.1, 0.0, 1.0);
    //    float easePower = 1.5;              // >1 = ease-out (slow then fast)
    //    float easedSpeed = pow(t, easePower);

    float distFromEdge = min(vUv.y, 1.0 - vUv.y) * 1.0;
    //    (0.5 + scrollSpeed)/2.0;
    float area = smoothstep(0.9, 0.0, distFromEdge);
    area = pow(area, 8.0);

    float intensity = 0.10;
    newUV.x -= (vUv.x - 0.5) * intensity * area;

    gl_FragColor = texture2D(tDiffuse, newUV);
}


//uniform sampler2D tDiffuse;
//varying vec2 vUv;
//uniform float scrollSpeed;
//
//void main(){
//    vec2 newUV = vUv;
//
//    float distFromEdge = min(vUv.y, 1.0 - vUv.y) * scrollSpeed/2.0;
//    //    float distFromEdge = min(vUv.y, 1.0 - vUv.y);
//    float area = smoothstep(0.9, 0.0, distFromEdge);
//    area = pow(area, 8.0);
//
//    float intensity = 0.10;
//    newUV.x -= (vUv.x - 0.5) * intensity * area;
//
//    gl_FragColor = texture2D(tDiffuse, newUV);
//}