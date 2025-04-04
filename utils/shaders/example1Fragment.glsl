varying float vNoise;
varying vec2 vUv;
uniform sampler2D uImage;
uniform float time;
uniform float hoverState;
uniform float aniIn;


void main()	{

    vec2 newUV = vUv;

    vec2 p = newUV;
    float x = hoverState + 1.0 - aniIn;
    x = smoothstep(.0,1.0,(x*2.0+p.y-1.0));
    vec4 f = mix(
    texture2D(uImage, (p-.5)*(1.-x)+.5),
    texture2D(uImage, (p-.5)*x+.5),
    x);

    gl_FragColor = f * vec4(1.0 , 1.0, 1.0 , aniIn );
    gl_FragColor.rgb += 0.05*vec3(vNoise);


}