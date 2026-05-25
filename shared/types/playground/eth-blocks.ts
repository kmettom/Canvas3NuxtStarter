import type * as THREE from "three";

export type EthBlocksAnimation = {
  meshId: string;
  textures: THREE.Texture[];
  imageBgMeshes: THREE.Mesh[];
  glassMesh: THREE.Mesh | null;
  ethBlocks: HTMLCollection | null;
  loadingBlockId: string;
  activeBlockId: string;
  blockLoadingTime: number;
  blocksBasePosition: number;
  blocksTopPadding: number;
  init: (ethBlocksWrapper: HTMLElement) => Promise<void>;
  createGlassBlockMesh: () => Promise<THREE.Mesh>;
  createImageBgMesh: (
    texture: THREE.Texture,
    id: number,
  ) => Promise<THREE.Mesh | null>;
  getVec4PositionFromClientRect: (clientRect: DOMRect) => THREE.Vector4;
  calculateUBlockPositions: () => THREE.Vector4[];
  render: () => void;
  imageBgChange: (index: number) => void;
  animateBlockSizeOnScroll: (elNode: HTMLElement, index: number) => void;
  firstEnterAnimation: () => void;
  pendingImageId: number;
  currentImageId: number;
  imageAniTimeline: gsap.core.Tween | null;
};
