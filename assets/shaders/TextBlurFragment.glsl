// Varyings
varying vec2 vUv;

// Uniforms: Common
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;

varying float vNoise;

// Generic uniforms
uniform float uTime;
uniform float uAniInText;
uniform float uDevicePixelRatio;
uniform vec2 uViewport;
uniform vec2 uMouse;
uniform vec2 uMouseMovement;
uniform vec2 uFooterGameBall;
uniform vec2 uMeshSize;
uniform float devicePixelRatio;

uniform sampler2D gradientMap;

float DISTANCE_COEF = 0.5;
float uBlurStrength;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

float createCircleTrail(float radius, vec2 mousePoint) {
  vec2 viewportUv = gl_FragCoord.xy / uViewport / uDevicePixelRatio;
  float viewportAspect = uViewport.x / uViewport.y;

  vec2 shapeUvTrail = viewportUv - mousePoint;
  shapeUvTrail /= vec2(1.0, viewportAspect);
  shapeUvTrail += mousePoint;
  float distTail = distance(shapeUvTrail, mousePoint);

  float circleRadius = max(0.0, radius / uViewport.x);
  float dist = smoothstep(circleRadius, circleRadius + 0.05, distTail);
  return dist;
}

float createDraggedTrail(
  vec2 mousePoint,
  vec2 mousePointPrev,
  float radiusStart,
  float radiusEnd
) {
  vec2 viewportUv = gl_FragCoord.xy / uViewport / uDevicePixelRatio;
  float viewportAspect = uViewport.x / uViewport.y;

  // Adjust UV coordinates for aspect ratio
  vec2 adjustedUv = viewportUv;
  adjustedUv.y /= viewportAspect;
  vec2 adjustedMousePoint = vec2(mousePoint.x, mousePoint.y / viewportAspect);
  vec2 adjustedMousePointPrev = vec2(
    mousePointPrev.x,
    mousePointPrev.y / viewportAspect
  );

  // Compute distances to current and previous mouse points
  float distToCurrent = distance(adjustedUv, adjustedMousePoint);
  float distToPrev = distance(adjustedUv, adjustedMousePointPrev);

  // Interpolate radius based on proximity to current or previous point
  float interpFactor = distToCurrent / (distToCurrent + distToPrev + 0.0001);
  float circleRadius = mix(radiusStart, radiusEnd, interpFactor) / uViewport.x;

  // Compute minimum distance to the line segment between points
  vec2 lineDir = adjustedMousePointPrev - adjustedMousePoint;
  float lineLength = length(lineDir);
  vec2 lineDirNorm = lineDir / (lineLength + 0.0001);
  float proj = clamp(
    dot(adjustedUv - adjustedMousePoint, lineDirNorm),
    0.0,
    lineLength
  );
  vec2 closestPoint = adjustedMousePoint + lineDirNorm * proj;
  float distToLine = distance(adjustedUv, closestPoint);

  // Smoothly fade out the trail based on distance
  float trail = smoothstep(circleRadius, circleRadius + 0.02, distToLine);
  return trail;
}

float createOverlay(float activeOverlay) {
  vec2 viewportUv =
    gl_FragCoord.xy / uViewport * uDevicePixelRatio * (1.0 - activeOverlay);
  float progress = smoothstep(
    activeOverlay,
    activeOverlay - 1.0,
    viewportUv.x - vUv.x
  );
  return progress;
}

void main() {
  vec2 mousePoint = vec2(uMouse.x, 1.0 - uMouse.y);
  vec2 mousePointPrev = vec2(uMouseMovement.x, 1.0 - uMouseMovement.y);
  vec2 ballPoint = vec2(uFooterGameBall.x, 1.0 - uFooterGameBall.y);

  float circleTrail = createDraggedTrail(mousePoint, mousePointPrev, 35.0, 1.0);

  float ballTrail = createCircleTrail(10.0, ballPoint);

  float overlayOpacity = createOverlay(uAniInText);
  vec2 newUv = vUv;

  vec3 mySample = texture2D(uMap, newUv).rgb;
  vec3 mySampleRGB = mySample.rgb;

  float aniInDistance = mix(0.5, 1.0, uAniInText * overlayOpacity);

  float sigDist =
    median(mySampleRGB.r, mySampleRGB.g, mySampleRGB.b) -
    DISTANCE_COEF / aniInDistance / ballTrail / circleTrail;
  float fill = clamp(sigDist / fwidth(sigDist) + DISTANCE_COEF, 0.0, 1.0);

  float finalAlpha = fill * overlayOpacity * ballTrail * circleTrail;

  gl_FragColor = vec4(uColor, finalAlpha);
  if (finalAlpha < uAlphaTest) discard;
}
