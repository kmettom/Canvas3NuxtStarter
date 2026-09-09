import scrollFragment from "~/assets/shaders/scrollFragment.glsl";
import scrollVertex from "~/assets/shaders/scrollVertex.glsl";
import scrollPlaygroundFragment from "~/assets/shaders/playground/scrollPlaygroundFragment.glsl";
import scrollPlaygroundVertex from "~/assets/shaders/playground/scrollPlaygroundVertex.glsl";
import projectBlurFragment from "~/assets/shaders/projectBlurFragment.glsl";
import projectBlurVertex from "~/assets/shaders/projectBlurVertex.glsl";
import TextBlurFragment from "~/assets/shaders/TextBlurFragment.glsl";
import TextBlurVertex from "~/assets/shaders/TextBlurVertex.glsl";
import example0Fragment from "~/assets/shaders/examples/example0Fragment.glsl";
import example0Vertex from "~/assets/shaders/examples/example0Vertex.glsl";
import example1Fragment from "~/assets/shaders/examples/example1Fragment.glsl";
import example1Vertex from "~/assets/shaders/examples/example1Vertex.glsl";
import playScrollPerformanceFragment from "~/assets/shaders/playground/playScrollPerformanceFragment.glsl";
import playScrollPerformanceVertex from "~/assets/shaders/playground/playScrollPerformanceVertex.glsl";
import playEthBlockNoDesignFragment from "~/assets/shaders/playground/playEthBlockNoDesignFragment.glsl";
import playEthBlockNoDesignVertex from "~/assets/shaders/playground/playEthBlockNoDesignVertex.glsl";
import playEthBlockGlassFragment from "~/assets/shaders/playground/playEthBlockGlassFragment.glsl";
import playEthBlockGlassVertex from "~/assets/shaders/playground/playEthBlockGlassVertex.glsl";
import playEthBlockImageBgFragment from "~/assets/shaders/playground/playEthBlockImageBgFragment.glsl";
import playEthBlockImageBgVertex from "~/assets/shaders/playground/playEthBlockImageBgVertex.glsl";

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
    scrollPlayground: {
      fragmentShader: scrollPlaygroundFragment,
      vertexShader: scrollPlaygroundVertex,
    },
    default: {
      fragmentShader: projectBlurFragment,
      vertexShader: projectBlurVertex,
      textFragment: TextBlurFragment,
      textVertex: TextBlurVertex,
    },
    example0: {
      fragmentShader: example0Fragment,
      vertexShader: example0Vertex,
    },
    example1: {
      fragmentShader: example1Fragment,
      vertexShader: example1Vertex,
    },
    playScrollPerformance: {
      fragmentShader: playScrollPerformanceFragment,
      vertexShader: playScrollPerformanceVertex,
    },
    playEthBlockNoDesign: {
      fragmentShader: playEthBlockNoDesignFragment,
      vertexShader: playEthBlockNoDesignVertex,
    },
    playEthBlockGlass: {
      fragmentShader: playEthBlockGlassFragment,
      vertexShader: playEthBlockGlassVertex,
    },
    playEthBlockImageBg: {
      fragmentShader: playEthBlockImageBgFragment,
      vertexShader: playEthBlockImageBgVertex,
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
  mouseTrackingEnabled: true,
  trackFps: true,
};

// export default CanvasOptionDefaults = CanvasOptions;
