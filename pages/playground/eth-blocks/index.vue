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
  type BlockExtended,
  deserializeBlock,
  generateLoadingBlockData,
  enterAni,
  blockContentAniIn,
} from "~/utils/playground/eth-blocks/web3-helpers";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
import { ethBlocksAnimation } from "~/utils/playground/eth-blocks/eth-blocks-scene";
import BlockContent from "~/components/playground/eth-blocks/blockContent.vue";
gsap.registerPlugin(SplitText);

//**************************
// DECLARATIONS
//**************************

const maxBlocks = 50;

const ethBlocks = ref<HTMLElement | null>(null);
const blocksBasePosition = ref(ethBlocksAnimation.blocksBasePosition);
const blocks = ref<Map<string, BlockExtended>>(new Map());
const blocksToRender = computed<BlockExtended[]>(() => {
  return [...blocks.value.values()].sort((a, b) =>
    a.blockId > b.blockId ? -1 : 1,
  );
});
let eventSource: EventSource;
const { data: initialBlocks } = await useFetch(
  "/api/playground/eth-blocks/latest",
);
initialBlocks.value?.forEach((raw: BlockExtended, index: number) => {
  const block = deserializeBlock(raw);
  const blockId = new Date().getTime().toString() + `_latest_${index}`;
  const loadingBlock = generateLoadingBlockData(blockId);
  blocks.value.set(blockId, generateBlockData(block, loadingBlock));
});

const tlNewBlockAniIn = gsap.timeline({
  paused: true,
  onComplete: () => {
    console.log("onComplete");
    newLoadingBlock();
  },
});

//**************************
// FUNCTIONS
//**************************

const blockIdCounter = ref(0);

async function newLoadingBlock() {
  blockIdCounter.value += 1;
  ethBlocksAnimation.loadingBlockId = blockIdCounter.value.toString();
  blocks.value.set(
    ethBlocksAnimation.loadingBlockId,
    generateLoadingBlockData(blockIdCounter.value.toString()),
  );
  await nextTick();
  const el = blocks.value.get(blockIdCounter.value.toString())
    ?.elRef as HTMLElement;
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
  const blockProgressBarEl = el.querySelector(".block-loading-progress");
  tlNewBlockAniIn.to(blockProgressBarEl, {
    width: "100%",
    duration: ethBlocksAnimation.blockLoadingTime,
  });
}

function addNewBlockEl(
  el: Element | ComponentPublicInstance | null,
  blockId: number,
) {
  const block = blocks.value.get(blockId.toString());
  if (block && !block.elRef) {
    block.elRef = el;
  }
}

const blockDoneAnimate = (blockId: string) => {
  const block = blocks.value.get(blockId);
  if (!block) return;
  const el = block.elRef as HTMLElement;
  if (!el) return;

  tlNewBlockAniIn.tweenTo(tlNewBlockAniIn.duration(), {
    duration: 0.3,
    ease: "linear",
    onComplete: () => {
      addTimelineAnimations();
    },
  });

  function addTimelineAnimations() {
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
      onComplete: () => {},
    });

    tlNewBlockAniIn.play();
  }
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
    blockDoneAnimate(ethBlocksAnimation.loadingBlockId);
    if (blocks.value.size > maxBlocks) {
      const oldestKey = blocks.value.keys().next().value;
      if (oldestKey) blocks.value.delete(oldestKey);
    }
  };
};

onUnmounted(() => eventSource?.close());

onMounted(async () => {
  addBlockListener();
  if (ethBlocks.value) {
    await ethBlocksAnimation.init(ethBlocks.value);
    blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;
  }
  await enterAni(tlNewBlockAniIn);
  await newLoadingBlock();
  tlNewBlockAniIn.play();
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
}
</style>
