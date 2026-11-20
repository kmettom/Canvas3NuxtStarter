import scrollFragment from "~/assets/shaders/scrollFragment.glsl";
import scrollVertex from "~/assets/shaders/scrollVertex.glsl";
import scrollPlaygroundFragment from "~/assets/shaders/playground/scrollPlaygroundFragment.glsl";
import scrollPlaygroundVertex from "~/assets/shaders/playground/scrollPlaygroundVertex.glsl";
import projectBlurFragment from "~/assets/shaders/projectBlurFragment.glsl";
import projectBlurVertex from "~/assets/shaders/projectBlurVertex.glsl";
import TextCRTBlurFragment from "~/assets/shaders/TextCRTBlurFragment.glsl";
import TextCRTBlurVertex from "~/assets/shaders/TextCRTBlurVertex.glsl";
import TextCRTBWVertex from "~/assets/shaders/TextCRTBWVertex.glsl";
import TextCRTBWFragment from "~/assets/shaders/TextCRTBWFragment.glsl";
import TextCRTGFragment from "~/assets/shaders/TextCRTGFragment.glsl";
import TextCRTGVertex from "~/assets/shaders/TextCRTGVertex.glsl";
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
import rippleSimulation from "~/assets/shaders//rippleSimulation.glsl";
import trailSimulation from "~/assets/shaders//trailSimulation.glsl";

export const Canvas3Options = {
  font: {
    fnt: "/fonts/PPFormula-CondensedBlack.fnt",
    atlas: "/fonts/PPFormula-CondensedBlack.png",
    colors: {
      light: { color: "#ebebeb" },
    },
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
      textFragment: TextCRTBlurFragment,
      textVertex: TextCRTBlurVertex,
    },
    textCRT: {
      textFragment: TextCRTBWFragment,
      textVertex: TextCRTBWVertex,
    },
    textCRTG: {
      textFragment: TextCRTGFragment,
      textVertex: TextCRTGVertex,
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
  simulations: {
    ripples: {
      fragmentShader: rippleSimulation,
      resolution: 256,
      substeps: 2,
    },
    // soft fading stroke - low resolution is enough, FADE in the shader is per step, so keep substeps at 1
    trail: {
      fragmentShader: trailSimulation,
      resolution: 128,
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
