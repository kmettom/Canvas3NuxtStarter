import type * as THREE from "three";
import type { Block } from "viem";

export type EthBlocksAnimation = {
  imageBgMeshes: THREE.Mesh[];
  glassMesh: THREE.Mesh | null;
  sceneRT: THREE.WebGLRenderTarget | null;
  ethBlockEls: HTMLCollection | null;
  loadingBlockId: number;
  activeBlockId: number;
  activeImageId: number;
  blocksBasePosition: number;
  blocksTopPadding: number;
  setBlockBasePosition: () => void;
  init: (ethBlockEls: HTMLCollection) => Promise<void>;
  destroy: () => void;
  revealFirstTexture: () => Promise<void>;
  startRender: () => Promise<void>;
  loadTextures: (
    amountOfTextures?: number | null,
    delay?: number,
  ) => Promise<void>;
  createGlassBlockMesh: () => Promise<THREE.Mesh>;
  createImageBgMesh: (
    texture: THREE.Texture,
    id: number,
  ) => Promise<THREE.Mesh | null>;
  getVec4PositionFromClientRect: (
    clientRect: DOMRect,
    canvasRect: DOMRect,
  ) => THREE.Vector4;
  updateVec4FromClientRect: (
    vec4: THREE.Vector4,
    clientRect: DOMRect,
    canvasRect: DOMRect,
  ) => void;
  calculateUBlockPositions: () => THREE.Vector4[];
  render: () => void;
  imageBgChange: (
    prevImageId: number,
    nextImageId: number,
    transactionsAmount?: number,
  ) => void;
  animateBlockSizeOnScroll: (
    elNode: HTMLElement,
    index: number,
    clientRect?: DOMRect,
  ) => void;
  pendingImageId: number;
  currentImageId: number;
  imageAniTimeline: gsap.core.Tween | null;
  firstEnterAniInProgress: boolean;
  isAnimating: boolean;
  _uBlocksPositions?: THREE.Vector4[];
  _lastScrollY?: number;
};

type BlockBase = {
  blockId: number;
  imageId: number;
  aniCoef?: number;
  loading: boolean;
  elRef?: Element | ComponentPublicInstance | null;
};

export type BlockLoading = BlockBase & {
  kind: string;
};

export type BlockExtended = BlockBase &
  Block & {
    kind: string;
    blockGasTargetPercent?: string;
    blockGasTargetCoef?: number;
    blockGasUsedPercent?: string;
    blockETHBurned?: bigint;
    blockWithdrawalsSum?: bigint;
    blockNetIssuanceETH?: bigint;
    blockHovered?: boolean;
  };

export type BlockItem = BlockLoading | BlockExtended;
