import scrollFragment from "./shaders/scrollFragment.glsl";
import scrollVertex from "./shaders/scrollVertex.glsl";
import projectBlurFragment from "./shaders/projectBlurFragment.glsl";
import projectBlurVertex from "./shaders/projectBlurVertex.glsl";
import TextBlurFragment from "./shaders/TextBlurFragment.glsl";
import TextBlurVertex from "./shaders/TextBlurVertex.glsl";
import heroBlurFragment from "./shaders/heroBlurFragment.glsl";
import heroBlurVertex from "./shaders/heroBlurVertex.glsl";
import example1Fragment from "./shaders/example1Fragment.glsl";
import example1Vertex from "./shaders/example1Vertex.glsl";
import example2Fragment from "./shaders/example2Fragment.glsl";
import example2Vertex from "./shaders/example2Vertex.glsl";
import example3Fragment from "./shaders/example3Fragment.glsl";
import example3Vertex from "./shaders/example3Vertex.glsl";
import example4Fragment from "./shaders/example4Fragment.glsl";
import example4Vertex from "./shaders/example4Vertex.glsl";
import example6Fragment from "./shaders/example6Fragment.glsl";
import example6Vertex from "./shaders/example6Vertex.glsl";

export const Canvas3Options = {
  font: {
    fnt: "./font/PPFormula-CondensedBlack.fnt",
    atlas: "./font/PPFormula-CondensedBlack.png",
  },
  shaders: {
    scroll: {
      fragmentShader: scrollFragment,
      vertexShader: scrollVertex,
    },
    default: {
      fragmentShader: projectBlurFragment,
      vertexShader: projectBlurVertex,
      textFragment: TextBlurFragment,
      textVertex: TextBlurVertex,
    },
    hero: {
      fragmentShader: heroBlurFragment,
      vertexShader: heroBlurVertex,
    },
    example1: {
      fragmentShader: example1Fragment,
      vertexShader: example1Vertex,
    },
    example2: {
      fragmentShader: example2Fragment,
      vertexShader: example2Vertex,
    },
    example3: {
      fragmentShader: example3Fragment,
      vertexShader: example3Vertex,
    },
    example4: {
      fragmentShader: example4Fragment,
      vertexShader: example4Vertex,
    },
    example6: {
      fragmentShader: example6Fragment,
      vertexShader: example6Vertex,
    },
  },
  activateMeshOptions: {
    image: {
      uAniInImage: { value: 0, duration: 1, ease: "power1.inOut" },
    },
    text: {
      uAniInText: { value: 0, duration: 1.5, ease: "power2.out" },
    },
  },
  canvasElement: {
    zIndex: -1,
  },
  prefersReducedMotion: false,
  isMobile: false,
  disabled: false,
};

// export default CanvasOptionDefaults = CanvasOptions;
