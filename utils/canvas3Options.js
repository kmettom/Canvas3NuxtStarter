import scrollFragment from "~/utils/shaders/scrollFragment.glsl";
import scrollVertex from "~/utils/shaders/scrollVertex.glsl";
import projectBlurFragment from "~/utils/shaders/projectBlurFragment.glsl";
import projectBlurVertex from "~/utils/shaders/projectBlurVertex.glsl";
import TextBlurFragment from "~/utils/shaders/TextBlurFragment.glsl";
import TextBlurVertex from "~/utils/shaders/TextBlurVertex.glsl";
import heroBlurFragment from "~/utils/shaders/heroBlurFragment.glsl";
import heroBlurVertex from "~/utils/shaders/heroBlurVertex.glsl";
import example1Fragment from "~/utils/shaders/example1Fragment.glsl";
import example1Vertex from "~/utils/shaders/example1Vertex.glsl";
import example2Fragment from "~/utils/shaders/example2Fragment.glsl";
import example2Vertex from "~/utils/shaders/example2Vertex.glsl";
import example3Fragment from "~/utils/shaders/example3Fragment.glsl";
import example3Vertex from "~/utils/shaders/example3Vertex.glsl";
import example4Fragment from "~/utils/shaders/example4Fragment.glsl";
import example4Vertex from "~/utils/shaders/example4Vertex.glsl";
import example6Fragment from "~/utils/shaders/example6Fragment.glsl";
import example6Vertex from "~/utils/shaders/example6Vertex.glsl";

export const CanvasOptions = {
  fonts: {
    PPFormula: {
      fnt: "/font/PPFormula-CondensedBlack.fnt",
      atlas: "/font/PPFormula-CondensedBlack.png",
    },
  },
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
};
