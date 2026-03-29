import type * as THREE from "three";

// Replace with your real Canvas3 import/type
declare const Canvas3: {
  addMeshToScene: (mesh: THREE.Mesh) => void;
  getMeshFromSceneByName: (name: string) => THREE.Mesh | null;
  addAnimationToRender: (name: string, cb: () => void) => void;
  setMeshPositionsUpdate: (flag: boolean) => void;
};

type EthBlocksAnimationSetup = {
  meshId: string;
  mesh: THREE.Mesh | null;
  material: THREE.Material | null;
  uniforms: any;
};

type EthBlocksAnimation = {
  setup: EthBlocksAnimationSetup;
  addMeshRectangle: (meshName: string, color: string) => THREE.Mesh | null;
  init: () => void;
  curtainShow: (positionX?: number, scaleX?: number) => void;
  render: () => void;
  imageChange: () => void;
  glassBlockPositionsUpdate: (blocks: any[]) => Promise<void>;
};

export const ethBlocksAnimation: EthBlocksAnimation = {
  setup: {
    meshId: "ethBlockBg",
    mesh: null,
    uniforms: {
      uBlocks: { value: [] },
    },
  },
  init: async (): Promise<void> => {
    // await Canvas3.addImageasMesh(name:'ethBlockBg');
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

  glassBlockPositionsUpdate: (blocks: any[]) => {
    ethBlocksAnimation.setup.uniforms.uBlocks = blocks;
  },

  render: (): void => {
    const { mesh, material, uniforms } = ethBlocksAnimation.setup;
    if (!mesh || !material) return;
    material.uniforms.uBlocks = uniforms.uBlocks;

    // mesh.position.x = positionX.value;
    // mesh.scale.x = scaleX.value;
  },

  // reset: (): void => {
  //   ethBlocksAnimation.setup.positionX.value = -window.innerWidth / 2;
  //   ethBlocksAnimation.setup.scaleX.value = 0;
  // },
};
