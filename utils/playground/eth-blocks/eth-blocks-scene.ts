import * as THREE from "three";

export type Vec4Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type MeshMaterialUniform = Record<
  string,
  { duration: number; ease: string | null | undefined; value: number }
>;

type EthBlocksAnimationSetup = {
  meshId: string;
  mesh: THREE.Object3D | null;
  material: THREE.Material;
  uniforms: MeshMaterialUniform;
  blocksVec4Positions: Map<string, Vec4Position>;
  imgHtmlEl: HTMLImageElement;
};

type EthBlocksAnimation = {
  setup: EthBlocksAnimationSetup | null;
  init: () => void;
  render: () => void;
  imageChange: () => void;
  glassBlockPositionsUpdate: (id: string, clientRect: DOMRect) => void;
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: null,
  //   {
  //   meshId: "ethBlockBg",
  //   mesh: new THREE.Mesh(),
  //   material: new THREE.MeshBasicMaterial(),
  //   blocksVec4Positions: new Map(),
  //   uniforms: { uAniInit: { value: 0, duration: 0.5, ease: "linear" } },
  //   imgHtmlEl: new HTMLImageElement(),
  // },
  init: async (): Promise<void> => {
    if (!ethBlocksAnimation) return;
    await Canvas3.addImageAsMesh(
      new HTMLImageElement(), //imgHtmlEl
      "ethBlockBg", //meshId
      "ethBlockBgShader", //shaderName
      {}, //meshUniforms
      {}, //activateMeshUniforms
    );
    ethBlocksAnimation.setup = {
      meshId: "ethBlockBg",
      mesh: Canvas3.getMeshFromSceneByName("ethBlockBg") ?? null,
      material: new THREE.MeshBasicMaterial(),
      blocksVec4Positions: new Map(),
      uniforms: { uAniInit: { value: 0, duration: 0.5, ease: "linear" } },
      imgHtmlEl: new HTMLImageElement(),
    };
    Canvas3.addAnimationToRender(
      "ethBlocksAnimation",
      ethBlocksAnimation.render,
    );
    // ethBlocksAnimation.reset();
  },

  imageChange: (): void => {
    // get mech and update the material or geometry etc... images should be already preloaded with some system
  },

  glassBlockPositionsUpdate: (id, clientRect) => {
    const vec4Position: Vec4Position = {
      x: clientRect.left,
      y: 10,
      w: 100,
      h: 200,
    };
    ethBlocksAnimation.setup?.blocksVec4Positions.set(id, vec4Position);
  },

  render: (): void => {
    if(ethBlocksAnimation.setup){
      const { mesh, material, uniforms, blocksVec4Positions } = ethBlocksAnimation.setup;
      if (!mesh || !material) return;
      // for (let i = 0; i < blockEls.size; i++) {
      //
      // }
      uniforms.uBlocks = blocksVec4Positions;
    }
  },

  // reset: (): void => {
  //   ethBlocksAnimation.setup.positionX.value = -window.innerWidth / 2;
  //   ethBlocksAnimation.setup.scaleX.value = 0;
  // },
};
