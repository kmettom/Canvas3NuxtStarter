<template>
  <div class="eth-blocks-page page-container eth-base-text">
    <div
      id="ethBlocks"
      ref="ethBlocksWrapper"
      class="eth-blocks"
      :style="{
        paddingTop: blocksBasePosition + 'px',
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
        :data-transactions="block?.transactions?.length ?? 100"
        :class="`eth-block ${block.loading ? 'block-loading' : ''}`"
      >
        <!--        @mouseenter="hoverBlock($event, true, block.blockId)"-->
        <!--        @mouseleave="hoverBlock($event, false, block.blockId)"-->
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
import {
  blockContentAniIn,
  enterAni,
} from "~/utils/playground/eth-blocks/eth-block-animation-helpers";
import { useEthBlocks } from "~/stores/playground/eth-blocks-store";
gsap.registerPlugin(SplitText);

//**************************
// DECLARATIONS
//**************************

const maxBlocks = 50;

const ethBlocksWrapper = ref<HTMLElement | null>(null);
const blocksBasePosition = ref(0);
const { ethBlocks } = useEthBlocks();
const blocksToRender = computed<BlockItem[]>(() => {
  return [...ethBlocks.value.values()].sort((a, b) =>
    a.blockId > b.blockId ? -1 : 1,
  );
});

const tlNewBlockAniIn = gsap.timeline();

let eventSource: EventSource;

//**************************
// FUNCTIONS
//**************************

const fetchInitialBlocks = async () => {
  const { data: initialBlocks } = await useFetch(
    "/api/playground/eth-blocks/latest",
  );
  initialBlocks.value?.forEach((raw: BlockExtended) => {
    const blockData = deserializeBlock(raw);
    ethBlocks.value.set(
      blockIdCounter.value,
      generateBlockData(blockIdCounter.value, blockData),
    );
    blockIdCounter.value += 1;
  });
};

const blockIdCounter = ref(0);

const blockToFullWidthAni = (block: Element) => {
  tlNewBlockAniIn.to(block, {
    duration: 0.2,
    height: "10px",
  });
  tlNewBlockAniIn.to(block, {
    width: "423px",
    duration: 0.3,
  });
};

const firstBlockLoaderAni = () => {
  const lastOfInitialBlock = getBlockElFromBlockId(2);
  if (!lastOfInitialBlock) return;
  blockToFullWidthAni(lastOfInitialBlock);
  const progressBarEl = lastOfInitialBlock.querySelector(
    ".block-loading-progress",
  );
  tlNewBlockAniIn.to(progressBarEl, {
    width: "100%",
    duration: 0.5,
  });
  tlNewBlockAniIn.to(progressBarEl, {
    duration: 0,
    right: 0,
    left: "initial",
  });
  tlNewBlockAniIn.to(progressBarEl, {
    width: "0%",
    duration: 0.2,
  });
  tlNewBlockAniIn.to(progressBarEl, {
    duration: 0,
    right: "initial",
    left: 0,
  });
};

async function newLoadingBlock(firstAnimation = false) {
  ethBlocksAnimation.loadingBlockId = blockIdCounter.value;
  const newLoadingBlockData = generateLoadingBlockData(blockIdCounter.value);
  ethBlocks.value.set(blockIdCounter.value, newLoadingBlockData);
  await nextTick();
  const el = getBlockElFromBlockId(blockIdCounter.value);
  if (!el) {
    return;
  }
  blockToFullWidthAni(el);
  blockIdCounter.value += 1;
  const blockProgressBarEl = el.querySelector(".block-loading-progress");
  tlNewBlockAniIn.fromTo(
    blockProgressBarEl,
    {
      left: 0,
      right: "initial",
      width: 0,
    },
    {
      width: "100%",
      duration: firstAnimation ? 5 : ethBlocksAnimation.blockLoadingTime,
    },
  );
}

const getBlockElFromBlockId = (blockId: number) => {
  if (!ethBlocksWrapper.value) return null;
  return ethBlocksWrapper.value.querySelector(
    '.eth-block[data-block-id="' + blockId + '"]',
  );
};

const blockDoneAnimate = (blockId: number) => {
  // return new Promise((resolve) => {
  const el = getBlockElFromBlockId(blockId);
  if (!el) return;

  const blockAppearAnimate = () => {
    const blockProgressBarEl = el.querySelector(".block-loading-progress");
    if (!blockProgressBarEl) return;
    tlNewBlockAniIn.to(blockProgressBarEl, {
      left: "initial",
      right: 0,
      duration: 0.2,
    });
    tlNewBlockAniIn.to(blockProgressBarEl, {
      width: 0,
      duration: 0.2,
    });
    tlNewBlockAniIn.fromTo(
      el,
      { height: "10px" },
      { height: "236px", duration: 0.5, marginTop: "20px" },
    );
    blockContentAniIn(el, tlNewBlockAniIn);
    tlNewBlockAniIn.to(blockProgressBarEl, {
      width: 0,
      duration: 0,
      opacity: 1,
      left: 0,
      right: "initial",
      onComplete: () => {
        newLoadingBlock();
      },
    });
    tlNewBlockAniIn.play();
  };

  tlNewBlockAniIn.tweenTo(tlNewBlockAniIn.duration(), {
    duration: 0.3,
    ease: "linear",
    onComplete: () => {
      blockAppearAnimate();
    },
  });
  // });
};

const addBlockListener = () => {
  eventSource = new EventSource("/api/playground/eth-blocks/watch");
  eventSource.onmessage = async ({ data }) => {
    const blockData = deserializeBlock(JSON.parse(data));
    const loadingBlock = ethBlocks.value.get(ethBlocksAnimation.loadingBlockId);
    if (!loadingBlock) return;
    ethBlocks.value.set(
      ethBlocksAnimation.loadingBlockId,
      generateBlockData(loadingBlock.blockId, blockData),
    );
    await nextTick();
    blockDoneAnimate(ethBlocksAnimation.loadingBlockId);
    if (ethBlocks.value.size > maxBlocks) {
      const oldestKey = ethBlocks.value.keys().next().value;
      if (oldestKey) ethBlocks.value.delete(oldestKey);
    }
  };
};

onUnmounted(() => eventSource?.close());

fetchInitialBlocks();
onMounted(async () => {
  if (!ethBlocksWrapper.value) return;
  const ethBlockEls = ethBlocksWrapper.value.children;
  if (!ethBlockEls) return;
  ethBlocksAnimation.setBlockBasePosition();
  blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;
  firstBlockLoaderAni();
  await ethBlocksAnimation.init(ethBlockEls);

  // Start animations as early as possible
  enterAni(tlNewBlockAniIn, ethBlockEls);

  await ethBlocksAnimation.startRender();

  addBlockListener();
  newLoadingBlock();

  // Heavy initialization in background
  ethBlocksAnimation.loadTextures(); // all final textures
});

// https://www.shadertoy.com/view/wccSDf
// https://www.shadertoy.com/view/wccSDf
// https://www.shadertoy.com/view/3cdXDX
// https://www.shadertoy.com/view/tfyXRz
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
  padding-bottom: 65%;
}

.eth-block {
  overflow: hidden;
  display: block;
  position: relative;
  margin: 0 auto;
  height: 0;
  width: 0;
  //opacity: 0;
  border-radius: 25px;
  //&:not(.block-loading) {
  //  opacity: 0;
  //}
}
</style>
