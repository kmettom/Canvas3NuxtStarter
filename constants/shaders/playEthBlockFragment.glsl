precision highp float;

varying vec2 vUv;
uniform sampler2D uImage;

uniform float uAniInImage;   // 0..1 reveal progress
uniform float uBlocks;       // 50..200 (more => smaller/more tiles)

uniform float uHover;
uniform float uBlockColor;

uniform vec2 uMeshSize;
uniform vec2 uTextureSize;

// --- your color funcs ---
vec3 blockRampColor(float t) {
    vec3 redColor  = vec3(82.0/255.0, 26.0/255.0, 12.0/255.0); // #521A0C
    vec3 blueColor = vec3(0.0745, 0.1216, 0.1569);
    vec3 neutral   = vec3(0.5);

    t = clamp(t, 0.0, 1.0);

    return (t < 0.5)
    ? mix(redColor, neutral, t / 0.5)
    : mix(neutral, blueColor, (t - 0.5) / 0.5);
}

vec3 applyColor(vec3 color) {
    vec3 tint = blockRampColor(uBlockColor);
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    vec3 tinted = tint * luma;
    return mix(color, tinted, 1.0);
}

// --- tiny hash for per-tile randomness ---
float hash21(vec2 p) {
    // stable pseudo-random [0..1]
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    // --- cover UV (your existing logic) ---
    float meshAspect = uMeshSize.x / uMeshSize.y;
    float textureAspect = uTextureSize.x / uTextureSize.y;

    vec2 uv = vUv;
    if (meshAspect > textureAspect) {
        float scale = textureAspect / meshAspect;
        uv.y = uv.y * scale + (1.0 - scale) / 2.0;
    } else {
        float scale = meshAspect / textureAspect;
        uv.x = uv.x * scale + (1.0 - scale) / 2.0;
    }

    vec4 tex = texture2D(uImage, uv);

    // --- TILE REVEAL MASK ---
    // clamp blocks to avoid div-by-0 / nonsense
    float cols = clamp(uBlocks, 50.0, 200.0);

    // keep tiles ~square in mesh space:
    // if mesh is wide, we need fewer rows; if tall, more rows
    float meshAR = uMeshSize.x / max(uMeshSize.y, 1.0);
    float rows = max(1.0, floor(cols / meshAR));

    vec2 grid = vec2(cols, rows);

    // which tile are we in?
    vec2 tileId = floor(uv * grid);

    // normalize x position 0..1 across columns
    float x01 = (tileId.x + 0.5) / grid.x;

    // add a little jitter per tile (so blocks don't pop in perfectly synced)
    float rnd = hash21(tileId);

    // reveal timing:
    float jitter = (rnd - 0.5) * 0.15;
    float w = 0.10;
    float t0 = clamp(x01 + jitter, 0.0, 1.0 - w);

    // progress drives the reveal
    float tileMask = smoothstep(t0, t0 + w, clamp(uAniInImage, 0.0, 1.0));

    // --- your color grading ---
    vec3 color = applyColor(tex.rgb);

    // final alpha = tileMask (this is the actual reveal)
    gl_FragColor = vec4(color, tex.a * tileMask);
}
