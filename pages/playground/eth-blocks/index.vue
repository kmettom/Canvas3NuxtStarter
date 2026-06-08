<template>
  <div class="eth-blocks-page page-container eth-base-text">
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
        v-action-on-scroll="{
          activeRange: 1,
          bidirectionalActivation: true,
          activateOnce: false,
          // trackOnly: true,
        }"
        :data-bg-image-id="block.imageId"
        :data-block-id="block.blockId"
        :data-transactions-amount="
          block.transactions?.length ?? DEFAULT_TRANSACTIONS_AMOUNT
        "
        :class="`eth-block ${block.loading ? 'block-loading' : ''}`"
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
  blockContentAniIn,
  enterAni,
} from "~/utils/playground/eth-blocks/eth-block-animation-helpers";
import {
  DEFAULT_BLOCK_LOADING_TIME,
  DEFAULT_TRANSACTIONS_AMOUNT,
  IMAGE_FILE_AMOUNT,
} from "~/constants/playground/eth-blocks";
gsap.registerPlugin(SplitText);

//**************************
// DECLARATIONS
//**************************

const maxBlocks = 50;
const { ethBlocks, blockIdCounter, blockImageIdCounter } = useEthBlocks();
const blocksBasePosition = ref(ethBlocksAnimation.blocksBasePosition);
const ethBlocksWrapper = ref<HTMLElement | null>(null);
const blocksToRender = computed<BlockItem[]>(() => {
  return [...ethBlocks.value.values()].sort((a, b) =>
    a.blockId > b.blockId ? -1 : 1,
  );
});
let eventSource: EventSource;

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
  if (blockImageIdCounter.value >= IMAGE_FILE_AMOUNT)
    blockImageIdCounter.value = 0;
};

const tlNewBlockAniIn = gsap.timeline({
  paused: true,
  onUpdate: () => {
    ethBlocksAnimation.isAnimating = true;
  },
  onComplete: () => {
    newLoadingBlock();
  },
});

//**************************
// FUNCTIONS
//**************************

const getBlockElFromBlockId = (blockId: number) => {
  if (!ethBlocksWrapper.value) return null;
  return ethBlocksWrapper.value.querySelector(
    '.eth-block[data-block-id="' + blockId + '"]',
  );
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
    duration: 0.2,
    height: "10px",
    onComplete: () => {
      if (ethBlocksAnimation.firstEnterAniInProgress) {
        ethBlocksAnimation.firstEnterAniInProgress = false;
      }
    },
  });
  tlNewBlockAniIn.to(el, {
    width: "100%",
    duration: 0.3,
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

  setTimeout(() => {
    ethBlocksAnimation.loadTextures(2, 0);
  }, 5000);

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
      { height: "236px", duration: 0.5, marginTop: "20px" },
    );

    blockContentAniIn(el, tlNewBlockAniIn);

    tlNewBlockAniIn.set(el.querySelector(".block-loading-progress"), {
      width: 0,
      duration: 0,
      opacity: 1,
      onComplete: () => {
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
    blockDoneAnimate(ethBlocksAnimation.loadingBlockId);
    if (ethBlocks.value.size > maxBlocks) {
      const oldestKey = ethBlocks.value.keys().next().value;
      if (oldestKey !== undefined) ethBlocks.value.delete(oldestKey);
    }
  };
};

onUnmounted(() => {
  ethBlocksAnimation.destroy();
  eventSource?.close();
  tlNewBlockAniIn.kill();
  window.removeEventListener("resize", handleResize);
});

await fetchInitialBlocks();

const handleResize = () => {
  Canvas3.resizeOnChange();
  ethBlocksAnimation.resizeImageBGMesh();
};

onMounted(async () => {
  window.addEventListener("resize", handleResize);

  if (!ethBlocksWrapper.value) return;
  const ethBlockEls = ethBlocksWrapper.value.children;
  if (!ethBlockEls) return;

  ethBlocksAnimation.setBlockBasePosition();
  blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;

  await ethBlocksAnimation.init(ethBlockEls);
  await ethBlocksAnimation.startRender();
  await ethBlocksAnimation.revealFirstTexture();

  addBlockListener();

  await enterAni(tlNewBlockAniIn, ethBlockEls);

  setTimeout(() => {
    ethBlocksAnimation.loadTextures(2, 0);
  }, 5000);
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
  margin: 0 auto;
  height: 0;
  width: 0;
  border-radius: 25px;
  will-change: transform, opacity;
  contain: layout paint style; /* isolates paint work */
  transition: border ease 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.25);
  &.block-loading {
    border: 1px solid rgba(255, 255, 255, 0.35);
    &:after {
      content: "";
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
