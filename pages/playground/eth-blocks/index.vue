<template>
  <div class="eth-blocks-page page-container eth-base-text">
    <div
      id="ethBlocks"
      ref="ethBlocks"
      class="eth-blocks"
      :style="{
        paddingTop: blocksBasePosition + 'px',
      }"
    >
      <div
        v-for="block in blocksToRender"
        :key="block.blockId"
        :ref="(el) => addNewBlockEl(el, block.blockId)"
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
  enterAni,
  blockContentAniIn,
} from "~/utils/playground/eth-blocks/web3-helpers";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
import { ethBlocksAnimation } from "~/utils/playground/eth-blocks/eth-blocks-scene";
import BlockContent from "~/components/playground/eth-blocks/blockContent.vue";
import type {
  BlockExtended,
  BlockItem,
} from "#shared/types/playground/eth-blocks";
gsap.registerPlugin(SplitText);

//**************************
// DECLARATIONS
//**************************

const maxBlocks = 50;

const ethBlocks = ref<HTMLElement | null>(null);
const blocksBasePosition = ref(ethBlocksAnimation.blocksBasePosition);
const blocks = ref<Map<string, BlockItem>>(new Map());
const blocksToRender = computed<BlockItem[]>(() => {
  return [...blocks.value.values()].sort((a, b) =>
    a.blockId > b.blockId ? -1 : 1,
  );
});

const tlNewBlockAniIn = gsap.timeline({
  paused: true,
  onComplete: () => {},
});

let eventSource: EventSource;

//**************************
// FUNCTIONS
//**************************

const fetchInitialBlocks = async () => {
  const { data: initialBlocks } = await useFetch(
    "/api/playground/eth-blocks/latest",
  );
  initialBlocks.value?.forEach((raw: BlockExtended, index: number) => {
    const block = deserializeBlock(raw);
    const blockId =
      index === 0
        ? "block_0"
        : new Date().getTime().toString() + `_latest_${index}`;
    const loadingBlock = generateLoadingBlockData(blockId);
    blocks.value.set(blockId, generateBlockData(block, loadingBlock));
  });
};

// const firstLoaderAni = async () => {};

const blockIdCounter = ref(0);
const newBlockId = computed(() => {
  return "block_" + blockIdCounter.value;
});

async function newLoadingBlock(firstAnimation = false) {
  ethBlocksAnimation.loadingBlockId = newBlockId.value;
  const blockData = generateLoadingBlockData(newBlockId.value);
  blocks.value.set(ethBlocksAnimation.loadingBlockId, blockData);
  await nextTick();
  const el = blocks.value.get(newBlockId.value)?.elRef as HTMLElement;
  if (!el) {
    return;
  }
  tlNewBlockAniIn.to(el, {
    duration: 0.2,
    height: "10px",
  });
  tlNewBlockAniIn.to(el, {
    width: "423px",
    duration: 0.3,
  });
  tlNewBlockAniIn.play();
  blockIdCounter.value += 1;
  return new Promise((resolve) => {
    const blockProgressBarEl = el.querySelector(".block-loading-progress");
    tlNewBlockAniIn.to(blockProgressBarEl, {
      width: "100%",
      duration: firstAnimation ? 1 : ethBlocksAnimation.blockLoadingTime,
      onComplete: () => {
        resolve(true);
      },
    });
  });
}

function addNewBlockEl(
  el: Element | ComponentPublicInstance | null,
  blockId: string,
) {
  const block = blocks.value.get(blockId.toString());
  if (block && !block.elRef) {
    block.elRef = el;
  }
}

const blockDoneAnimate = async (blockId: string) => {
  const block = blocks.value.get(blockId);
  if (!block) return;
  const el = block.elRef as HTMLElement;
  if (!el) return;

  return new Promise((resolve) => {
    const addTimelineAnimations = () => {
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

      tlNewBlockAniIn.to(el.querySelector(".block-loading-progress"), {
        width: 0,
        duration: 0,
        opacity: 1,
        onComplete: () => {
          resolve(true);
        },
      });

      // tlNewBlockAniIn.play();
    };

    tlNewBlockAniIn.tweenTo(tlNewBlockAniIn.duration(), {
      duration: 0.3,
      ease: "linear",
      onComplete: () => {
        addTimelineAnimations();
      },
    });
  });
};

const addBlockListener = () => {
  eventSource = new EventSource("/api/playground/eth-blocks/watch");
  eventSource.onmessage = async ({ data }) => {
    const block = deserializeBlock(JSON.parse(data));
    const loadingBlock = blocks.value.get(ethBlocksAnimation.loadingBlockId);
    if (!loadingBlock) return;
    blocks.value.set(
      ethBlocksAnimation.loadingBlockId,
      generateBlockData(block, loadingBlock),
    );
    await nextTick();
    await blockDoneAnimate(ethBlocksAnimation.loadingBlockId);
    await newLoadingBlock();
    if (blocks.value.size > maxBlocks) {
      const oldestKey = blocks.value.keys().next().value;
      if (oldestKey) blocks.value.delete(oldestKey);
    }
  };
};

onUnmounted(() => eventSource?.close());

onMounted(async () => {
  await newLoadingBlock(true);
  if (ethBlocks.value) {
    await ethBlocksAnimation.init(ethBlocks.value);
    blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;
  }

  await fetchInitialBlocks();
  await enterAni(tlNewBlockAniIn);
  addBlockListener();
  await ethBlocksAnimation.loadTextures();
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
  border-radius: 25px;
  //&:not(.loading-block){
  //  opacity: 0;
  //}
}
</style>
