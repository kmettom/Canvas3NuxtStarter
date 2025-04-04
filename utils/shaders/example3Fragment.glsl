varying float vNoise;
varying vec2 vUv;
uniform sampler2D uImage;
uniform float aniIn;

void main()	{

    vec2 newUV = vUv;

    vec4 imageView =  texture2D( uImage , newUV ) * vec4( 1.0 , 1.0 , 1.0,  aniIn );

    gl_FragColor = imageView;
    gl_FragColor.rgb -= 0.15*vec3(vNoise);
}
