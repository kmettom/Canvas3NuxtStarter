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
      <!--      :ref="(el) => addNewBlockEl(el, block.blockId)"-->

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

const tlNewBlockAniIn = gsap.timeline({
  // paused: true,
  // onComplete: () => {},
});

let eventSource: EventSource;

//**************************
// FUNCTIONS
//**************************

const fetchInitialBlocks = async () => {
  const { data: initialBlocks } = await useFetch(
    "/api/playground/eth-blocks/latest",
  );
  initialBlocks.value?.forEach((raw: BlockExtended) => {
    const block = deserializeBlock(raw);
    const blockId = blockIdCounter.value;
    const loadingBlock = generateLoadingBlockData(blockId.toString());
    ethBlocks.value.set(
      blockId.toString(),
      generateBlockData(block, loadingBlock),
    );
    blockIdCounter.value += 1;
  });
};

const blockIdCounter = ref(0);
const newBlockId = computed(() => {
  return "block_" + blockIdCounter.value;
});

async function newLoadingBlock(firstAnimation = false) {
  ethBlocksAnimation.loadingBlockId = newBlockId.value;
  const blockData = generateLoadingBlockData(newBlockId.value);
  ethBlocks.value.set(ethBlocksAnimation.loadingBlockId, blockData);
  await nextTick();
  const el = getElFromBlockId(newBlockId.value);
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
      duration: firstAnimation ? 5 : ethBlocksAnimation.blockLoadingTime,
      onComplete: () => {
        resolve(true);
      },
    });
  });
}

// function addNewBlockEl(
//   el: Element | ComponentPublicInstance | null,
//   blockId: string,
// ) {
//   const block = blocks.value.get(blockId.toString());
//   if (block && !block.elRef) {
//     block.elRef = el;
//   }
// }

const getElFromBlockId = (blockId: string) => {
  const block = ethBlocks.value.get(blockId);
  if (!block) return;
  return block.elRef as HTMLElement;
};

// const progressBarFinish = () => {
//   tlNewBlockAniIn.tweenTo(tlNewBlockAniIn.duration(), {
//     duration: 0.3,
//     ease: "linear",
//   });
// };

const resetProgressBar = (blockId: string) => {
  const el = getElFromBlockId(blockId);
  if (!el) return;
  const blockProgressBarEl = el.querySelector(".block-loading-progress");
  if (!blockProgressBarEl) return;
  tlNewBlockAniIn.to(blockProgressBarEl, {
    width: 0,
    duration: 0,
    opacity: 1,
  });
};

const blockDoneAnimate = async (blockId: string) => {
  const el = getElFromBlockId(blockId);
  if (!el) return;

  return new Promise((resolve) => {
    const addTimelineAnimations = async () => {
      tlNewBlockAniIn.fromTo(
        el,
        { height: "10px" },
        { height: "236px", duration: 0.5, marginTop: "20px" },
      );
      blockContentAniIn(el, tlNewBlockAniIn);
      tlNewBlockAniIn.call(() => {
        resolve(true);
      });
    };

    tlNewBlockAniIn.tweenTo(tlNewBlockAniIn.duration(), {
      duration: 0.3,
      ease: "linear",
      onComplete: () => {
        resetProgressBar(blockId);
        addTimelineAnimations();
      },
    });
  });
};

const addBlockListener = () => {
  eventSource = new EventSource("/api/playground/eth-blocks/watch");
  eventSource.onmessage = async ({ data }) => {
    const block = deserializeBlock(JSON.parse(data));
    const loadingBlock = ethBlocks.value.get(ethBlocksAnimation.loadingBlockId);
    if (!loadingBlock) return;
    ethBlocks.value.set(
      ethBlocksAnimation.loadingBlockId,
      generateBlockData(block, loadingBlock),
    );
    await nextTick();
    await blockDoneAnimate(ethBlocksAnimation.loadingBlockId);
    await newLoadingBlock();
    if (ethBlocks.value.size > maxBlocks) {
      const oldestKey = ethBlocks.value.keys().next().value;
      if (oldestKey) ethBlocks.value.delete(oldestKey);
    }
  };
};

onUnmounted(() => eventSource?.close());

fetchInitialBlocks();
onMounted(async () => {
  console.log("mounted");
  ethBlocksAnimation.setBlockBasePosition();
  blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;
  if (ethBlocksWrapper.value) {
    await ethBlocksAnimation.init(ethBlocksWrapper.value);
    ethBlocksAnimation.loadTextures(); // all final textures
  }
  enterAni(tlNewBlockAniIn, ethBlocksWrapper.value);
  addBlockListener();
  await newLoadingBlock();
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
  opacity: 0;
  border-radius: 25px;
  &:not(.block-loading) {
    opacity: 0;
  }
}
</style>
