<template>
  <div class="eth-blocks-page page-container eth-base-text">
    <credentials />
    <div
      id="ethBlocks"
      ref="ethBlocksWrapper"
      class="eth-blocks"
      :style="{
        paddingTop: blocksBasePosition + 'px',
        paddingBottom: blocksBasePosition * 2 + 'px',
      }"
    >
      <div
        v-for="block in blocksToRender"
        :key="block.blockId"
        :data-bg-image-id="block.imageId"
        :data-block-id="block.blockId"
        :data-transactions-amount="
          block.transactions?.length ?? DEFAULT_TRANSACTIONS_AMOUNT
        "
        :class="`eth-block ${block.loading ? 'block-loading' : ''}`"
        @mouseenter="hoverBlock(block.blockId)"
        @mouseleave="unHoverBlock()"
      >
        <blockContent :block="block" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import {
  generateBlockData,
  deserializeBlock,
  generateLoadingBlockData,
  ETH_ANI_CALLBACK_NAME,
} from "~/utils/playground/eth-blocks/web3-helpers";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
import { ethBlocksAnimation } from "~/utils/playground/eth-blocks/eth-blocks-scene";
import BlockContent from "~/components/playground/eth-blocks/blockContent.vue";
import type {
  BlockExtended,
  BlockItem,
} from "#shared/types/playground/eth-blocks";
import { useEthBlocks } from "~/stores/playground/eth-blocks-store";
import {
  blockBorderFull,
  blockBorderTrans,
  blockContentAniIn,
  credentialsAniIn,
  enterAni,
} from "~/utils/playground/eth-blocks/eth-block-animation-helpers";
import {
  // BLOCKS_MAX_AMOUNT,
  DEFAULT_BLOCK_LOADING_TIME,
  DEFAULT_TRANSACTIONS_AMOUNT,
  IMAGE_FILE_AMOUNT,
  NEXT_IMAGE_BATCH_LOAD_AMOUNT,
} from "~/constants/playground/eth-blocks";
import Credentials from "~/components/playground/eth-blocks/credentials.vue";
import type { ShaderMaterial } from "three";
gsap.registerPlugin(SplitText);

//**************************
// DECLARATIONS
//**************************

const displayStore = useDisplayStore();

const { ethBlocks, blockIdCounter, blockImageIdCounter } = useEthBlocks();
const blocksBasePosition = ref(ethBlocksAnimation.blocksBasePosition);
const ethBlocksWrapper = ref<HTMLElement | null>(null);
const scrollTimeout: number | null = null;
const blocksToRender = computed<BlockItem[]>(() => {
  return [...ethBlocks.value.values()].sort((a, b) =>
    a.blockId > b.blockId ? -1 : 1,
  );
});
let eventSource: EventSource;

// Small screens skip the WebGL scene (bg images + glass shader) entirely and
// only run the HTML blocks with gsap animations. Mobile Safari runs out of GPU
// memory with the full scene. Decided in onMounted, as the store isn't
// initialised during SSR.
let canvasSceneEnabled = false;
const setEthRender = (state: boolean, animationId: string) => {
  if (!canvasSceneEnabled) return;
  Canvas3.setAnimationToRender(ETH_ANI_CALLBACK_NAME, state, animationId);
};

async function fetchInitialBlocks() {
  await useAsyncData("ethBlocksInitial", async () => {
    const initialBlocks = await $fetch<BlockExtended[]>(
      "/api/playground/eth-blocks/latest",
    );
    initialBlocks?.forEach((raw: BlockExtended) => {
      const blockData = deserializeBlock(raw);
      ethBlocks.value.set(
        blockIdCounter.value,
        generateBlockData(
          blockIdCounter.value,
          blockImageIdCounter.value,
          blockData,
        ),
      );
      blockCountersUpdate();
    });
    return true;
  });
}

const blockCountersUpdate = () => {
  blockIdCounter.value += 1;
  blockImageIdCounter.value += 1;
  const imageFileAmount = import.meta.client
    ? ethBlocksAnimation.getImageFileAmount()
    : IMAGE_FILE_AMOUNT;
  if (blockImageIdCounter.value >= imageFileAmount)
    blockImageIdCounter.value = 0;
};

const tlNewBlockAniIn = gsap.timeline({
  paused: true,
  onStart: () => {
    setEthRender(true, "firstAnimationIn");
  },
  onUpdate: () => {
    ethBlocksAnimation.isAnimating = true;
  },
  onComplete: () => {
    newLoadingBlock();
    setEthRender(false, "firstAnimationIn");
  },
});

const tlEnterBlockAniIn = gsap.timeline({});

//**************************
// FUNCTIONS
//**************************

const hoverTl = gsap.timeline();

const unHoverBlock = () => {
  if (!canvasSceneEnabled || !ethBlocksAnimation.glassMesh) return;
  setEthRender(true, "unHoverBlock");

  const material = ethBlocksAnimation.glassMesh.material as ShaderMaterial;
  if (material.uniforms.uHoverProgress !== undefined) {
    gsap.set(material.uniforms.uHoverProgress, {
      value: 1,
    });
  }
  if (material.uniforms.uUnHoverProgress !== undefined) {
    hoverTl.fromTo(
      material.uniforms.uUnHoverProgress,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.15,
        onComplete: () => {
          // if (material.uniforms.uUnHoverProgress !== undefined)
          //   gsap.set(material.uniforms.uUnHoverProgress, { value: 0 });
          // if (material.uniforms.uHoverProgress !== undefined)
          //   gsap.set(material.uniforms.uHoverProgress, { value: 0 });

          ethBlocksAnimation.hoveredBlockId = -1;
          ethBlocksAnimation.calculateUBlockPositions();
          setEthRender(false, "unHoverBlock");
        },
      },
    );
  }
};

const hoverBlock = (blockId: number) => {
  if (!canvasSceneEnabled || !ethBlocksAnimation.glassMesh) return;
  setEthRender(true, "hoverBlock");

  const material = ethBlocksAnimation.glassMesh.material as ShaderMaterial;

  hoverTl.clear();

  if (material.uniforms.uUnHoverProgress !== undefined) {
    gsap.set(material.uniforms.uUnHoverProgress, {
      value: 0,
    });
  }
  if (material.uniforms.uHoverProgress !== undefined) {
    gsap.set(material.uniforms.uHoverProgress, { value: 0 });
    gsap.fromTo(
      material.uniforms.uHoverProgress,
      {
        value: 0,
      },
      {
        value: 1,
        duration: 0.3,
        ease: "power1.out",
        onStart: () => {
          ethBlocksAnimation.hoveredBlockId = blockId;
        },
        onComplete: () => {
          setEthRender(false, "hoverBlock");
        },
      },
    );
  }
};

const getBlockElFromBlockId = (blockId: number) => {
  if (!ethBlocksWrapper.value) return null;
  return ethBlocksWrapper.value.querySelector(
    '.eth-block[data-block-id="' + blockId + '"]',
  );
};

function firstLoadingBlockAniStart() {
  const el = document.querySelectorAll(".eth-block")[0];
  if (!el) return;
  tlEnterBlockAniIn.to(el, {
    height: "10px",
    border: blockBorderTrans,
  });
  tlEnterBlockAniIn.to(el, {
    opacity: 1,
    border: blockBorderFull,
    width: "100%",
    duration: 0.4,
  });
  const blockProgressBarEl = el.querySelector(".block-loading-progress");
  tlEnterBlockAniIn.to(blockProgressBarEl, {
    width: "100%",
    duration: 10,
  });
}

const firstLoadingBlockAniEnd = () => {
  return new Promise((resolve) => {
    const el = document.querySelectorAll(".eth-block")[0];
    if (!el) {
      resolve(false);
      return;
    }

    const progressDuration = tlEnterBlockAniIn.progress() < 0.05 ? 0.75 : 0.35;

    gsap.to(tlEnterBlockAniIn, {
      progress: 1,
      duration: progressDuration,
      onComplete: () => {
        tlEnterBlockAniIn.clear();

        const blockProgressBarEl = el.querySelector(".block-loading-progress");

        tlEnterBlockAniIn.to(blockProgressBarEl, {
          width: "0%",
          duration: 0.2,
          right: 0,
          left: "initial",
          onComplete: () => {
            resolve(true);
          },
        });
      },
    });
  });
};

async function newLoadingBlock() {
  ethBlocksAnimation.loadingBlockId = blockIdCounter.value;
  const newLoadingBlockData = generateLoadingBlockData(
    blockIdCounter.value,
    blockImageIdCounter.value,
  );
  ethBlocks.value.set(blockIdCounter.value, newLoadingBlockData);
  await nextTick();
  const el = getBlockElFromBlockId(blockIdCounter.value);
  if (!el) {
    return;
  }
  blockCountersUpdate();
  tlNewBlockAniIn.add(() => {
    el.classList.add("animating");
  });
  tlNewBlockAniIn.to(el, {
    height: "10px",
    marginBottom: "-12px",
    border: blockBorderTrans,
    duration: 0.15,
    opacity: 0,
  });
  tlNewBlockAniIn.to(el, {
    border: blockBorderFull,
    opacity: 1,
    width: "100%",
    duration: 0.3,
    onStart: () => {
      if (ethBlocksAnimation.firstEnterAniInProgress) {
        ethBlocksAnimation.firstEnterAniInProgress = false;
      }
    },
  });
  const blockProgressBarEl = el.querySelector(".block-loading-progress");
  tlNewBlockAniIn.to(blockProgressBarEl, {
    width: "100%",
    duration: DEFAULT_BLOCK_LOADING_TIME,
    onComplete: () => {
      el.classList.remove("animating");
    },
  });
}

const blockDoneAnimate = (blockId: number) => {
  const el = getBlockElFromBlockId(blockId);
  if (!el) {
    return;
  }
  if (
    canvasSceneEnabled &&
    ethBlocks.value.size >= ethBlocksAnimation.imageBgMeshes.length &&
    ethBlocks.value.size < ethBlocksAnimation.getImageFileAmount()
  ) {
    setTimeout(() => {
      ethBlocksAnimation.loadTextures(NEXT_IMAGE_BATCH_LOAD_AMOUNT);
    }, 4000);
  }

  tlNewBlockAniIn.tweenTo(tlNewBlockAniIn.duration(), {
    duration: 0.3,
    ease: "linear",
    onComplete: () => {
      addTimelineAnimations();
    },
  });

  function addTimelineAnimations() {
    if (!el) {
      return;
    }
    setEthRender(true, "newBlockIn");
    tlNewBlockAniIn.clear();
    tlNewBlockAniIn.add(() => {
      el.classList.add("animating");
    });
    tlNewBlockAniIn.to(el.querySelector(".block-loading-progress"), {
      width: "0%",
      duration: 0.15,
      right: 0,
      left: "initial",
    });

    tlNewBlockAniIn.fromTo(
      el,
      { height: "10px" },
      {
        height: "236px",
        duration: 0.5,
        marginTop: displayStore.isMobile ? "20px" : "30px",
      },
    );

    blockContentAniIn(el, tlNewBlockAniIn);

    tlNewBlockAniIn.set(el.querySelector(".block-loading-progress"), {
      width: 0,
      duration: 0,
      opacity: 1,
      onComplete: () => {
        setTimeout(() => {
          setEthRender(false, "newBlockIn");
        }, 500);
        el.classList.remove("animating");
      },
    });
    tlNewBlockAniIn.play();
  }
};

const addBlockListener = () => {
  eventSource = new EventSource("/api/playground/eth-blocks/watch");
  eventSource.onmessage = async ({ data }) => {
    const blockData = deserializeBlock(JSON.parse(data));
    const loadingBlock = ethBlocks.value.get(ethBlocksAnimation.loadingBlockId);
    if (!loadingBlock) return;
    ethBlocks.value.set(
      loadingBlock.blockId,
      generateBlockData(loadingBlock.blockId, loadingBlock.imageId, blockData),
    );
    await nextTick();
    ethBlocksAnimation._setupIntersectionObserver();
    blockDoneAnimate(ethBlocksAnimation.loadingBlockId);
    // if (ethBlocks.value.size > BLOCKS_MAX_AMOUNT) {
    //   const oldestKey = ethBlocks.value.keys().next().value;
    //   if (oldestKey !== undefined) ethBlocks.value.delete(oldestKey);
    // }
  };
};

onUnmounted(() => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  ethBlocksAnimation.destroy();
  eventSource?.close();
  tlNewBlockAniIn.kill();
  window.removeEventListener("resize", handleResize);
  contextCanvas?.removeEventListener("webglcontextlost", handleContextLost);
});

// preventDefault lets the browser restore the context instead of leaving
// the canvas permanently dead
let contextCanvas: HTMLCanvasElement | null = null;
const handleContextLost = (event: Event) => {
  event.preventDefault();
  console.warn("[eth-blocks] WebGL context lost");
};

await fetchInitialBlocks();

const handleResize = () => {
  Canvas3.resizeOnChange();
  if (canvasSceneEnabled) ethBlocksAnimation.resizeImageBGMesh();
};

onMounted(async () => {
  // app.vue initialises the display store after child pages mount, so on a
  // first load isMobile can still be null here
  const isSmallScreen =
    displayStore.isMobile ?? window.innerWidth < displayStore.mobileBreakPoint;
  canvasSceneEnabled = !isSmallScreen;

  firstLoadingBlockAniStart();

  window.addEventListener("resize", handleResize);
  if (canvasSceneEnabled) {
    contextCanvas = Canvas3.getRenderer()?.domElement ?? null;
    contextCanvas?.addEventListener("webglcontextlost", handleContextLost);
  }

  if (!ethBlocksWrapper.value) return;
  const ethBlockEls = ethBlocksWrapper.value.children;
  if (!ethBlockEls) return;

  ethBlocksAnimation.setBlockBasePosition();
  blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;

  if (canvasSceneEnabled) {
    await ethBlocksAnimation.init(ethBlockEls);
    await ethBlocksAnimation.startRender();
  }

  await firstLoadingBlockAniEnd();

  addBlockListener();
  setEthRender(true, "firstAnimationIn");
  await enterAni(tlEnterBlockAniIn, ethBlockEls, !!displayStore.isMobile);
  tlNewBlockAniIn.play();

  credentialsAniIn(tlEnterBlockAniIn);
});
</script>
<style lang="scss" scoped>
.eth-base-text {
  font-size: 12px;
}

.eth-blocks-page {
  position: relative;
  min-height: 100vh;
  color: white;
}

.eth-blocks {
  width: 423px;
  margin: 0 auto;
  @include respond-width($w-xs) {
    width: 95%;
  }
}

.eth-block {
  overflow: hidden;
  display: block;
  position: relative;
  margin: 0 auto -2px;
  height: 0;
  width: 0;
  border-radius: 18px;
  border: 1px solid transparent;
  will-change: transform, opacity;
  contain: layout paint style;
  transition: border ease 0.3s;
  &.block-loading {
    &:after {
      content: "";
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
