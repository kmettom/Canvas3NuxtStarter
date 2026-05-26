import type * as THREE from "three";
import type { Block } from "viem";

export type EthBlocksAnimation = {
  imageBgMeshes: THREE.Mesh[];
  glassMesh: THREE.Mesh | null;
  sceneRT: THREE.WebGLRenderTarget | null;
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
  pendingImageId: number;
  currentImageId: number;
  imageAniTimeline: gsap.core.Tween | null;
};

type BlockBase = {
  blockId: string;
  imageId: string;
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
