import scrollFragment from "~/assets/shaders/scrollFragment.glsl";
import scrollVertex from "~/assets/shaders/scrollVertex.glsl";
import projectBlurFragment from "~/assets/shaders/projectBlurFragment.glsl";
import projectBlurVertex from "~/assets/shaders/projectBlurVertex.glsl";
import TextBlurFragment from "~/assets/shaders/TextBlurFragment.glsl";
import TextBlurVertex from "~/assets/shaders/TextBlurVertex.glsl";
import heroBlurFragment from "~/assets/shaders/heroBlurFragment.glsl";
import heroBlurVertex from "~/assets/shaders/heroBlurVertex.glsl";
import example0Fragment from "~/assets/shaders/example0Fragment.glsl";
import example0Vertex from "~/assets/shaders/example0Vertex.glsl";
import example1Fragment from "~/assets/shaders/example1Fragment.glsl";
import example1Vertex from "~/assets/shaders/example1Vertex.glsl";
import example2Fragment from "~/assets/shaders/example2Fragment.glsl";
import example2Vertex from "~/assets/shaders/example2Vertex.glsl";
import example3Fragment from "~/assets/shaders/example3Fragment.glsl";
import example3Vertex from "~/assets/shaders/example3Vertex.glsl";
import example4Fragment from "~/assets/shaders/example4Fragment.glsl";
import example4Vertex from "~/assets/shaders/example4Vertex.glsl";
import example6Fragment from "~/assets/shaders/example6Fragment.glsl";
import example6Vertex from "~/assets/shaders/example6Vertex.glsl";
import playEthBlockNoDesignFragment from "~/assets/shaders/playEthBlockNoDesignFragment.glsl";
import playEthBlockNoDesignVertex from "~/assets/shaders/playEthBlockNoDesignVertex.glsl";
import playEthBlockGlassFragment from "~/assets/shaders/playEthBlockGlassFragment.glsl";
import playEthBlockGlassVertex from "~/assets/shaders/playEthBlockGlassVertex.glsl";
// import playEthBlockImageBgFragmentBlocks from "./shaders/playEthBlockImageBgFragment_blocks.glsl";
import playEthBlockImageBgFragment from "~/assets/shaders/playEthBlockImageBgFragment.glsl";
import playEthBlockImageBgVertex from "~/assets/shaders/playEthBlockImageBgVertex.glsl";

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
    example0: {
      fragmentShader: example0Fragment,
      vertexShader: example0Vertex,
    },
    example1: {
      fragmentShader: example1Fragment,
      vertexShader: example1Vertex,
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
