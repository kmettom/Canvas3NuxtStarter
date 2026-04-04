import * as THREE from "three";

export type Vec4Position = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type EthBlocksAnimationSetup = {
  meshId: string;
  mesh: THREE.Mesh;
  material: THREE.Material;
  uniforms: any;
  blocksVec4Positions: Map<string, Vec4Position>;
};

type EthBlocksAnimation = {
  setup: EthBlocksAnimationSetup;
  addMeshRectangle: (meshName: string, color: string) => THREE.Mesh | null;
  init: () => void;
  curtainShow: (positionX?: number, scaleX?: number) => void;
  render: () => void;
  imageChange: () => void;
  glassBlockPositionsUpdate: (id: string, clientRect: DOMRect) => void;
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: {
    meshId: "ethBlockBg",
    mesh: new THREE.Mesh(),
    material: new THREE.MeshBasicMaterial(),
    blocksVec4Positions: new Map(),
    uniforms: {},
    imgHtmlEl: new HTMLImageElement(),
  },
  init: async (): Promise<void> => {
    if (!ethBlocksAnimation) return;
    await Canvas3.addImageAsMesh(
      new HTMLImageElement(), //imgHtmlEl
      "ethBlockBg", //meshId
      "ethBlockBgShader", //shaderName
      {}, //meshUniforms
      {}, //activateMeshUniforms
    );
    ethBlocksAnimation.setup.mesh =
      Canvas3.getMeshFromSceneByName("ethBlockBg");
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
    ethBlocksAnimation.setup.blocksVec4Positions.set(id, vec4Position);
  },

  render: (): void => {
    const { mesh, material, uniforms, blocksVec4Positions } =
      ethBlocksAnimation.setup;
    if (!mesh || !material) return;
    // for (let i = 0; i < blockEls.size; i++) {
    //
    // }
    uniforms.uBlocks = blocksVec4Positions;
  },

  // reset: (): void => {
  //   ethBlocksAnimation.setup.positionX.value = -window.innerWidth / 2;
  //   ethBlocksAnimation.setup.scaleX.value = 0;
  // },
};
