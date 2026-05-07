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
        @mouseenter="hoverBlock($event, true, block.blockId)"
        @mouseleave="hoverBlock($event, false, block.blockId)"
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
  type BlockExtended,
  deserializeBlock,
  generateLoadingBlockData,
} from "~/utils/playground/eth-blocks/web3-helpers";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
import { ethBlocksAnimation } from "~/utils/playground/eth-blocks/eth-blocks-scene";
import BlockContent from "~/components/playground/eth-blocks/blockContent.vue";

gsap.registerPlugin(SplitText);

const ethBlocks = ref<HTMLElement | null>(null);

const blocksBasePosition = ref(ethBlocksAnimation.blocksBasePosition);

const blocks = ref<Map<string, BlockExtended>>(new Map());

const blocksToRender = computed<BlockExtended[]>(() => {
  return [...blocks.value.values()].sort((a, b) =>
    a.blockId > b.blockId ? -1 : 1,
  );
});

const hoverBlock = (event: Event, status: boolean, blockId: string) => {
  const tl = gsap.timeline({});
  tl.call(
    () => {
      const blockToAnimate = blocks.value.get(blockId);
      if (blockToAnimate) {
        blockToAnimate.blockHovered = status;
      }
    },
    undefined,
    "<",
  );
};

const aniContentValues = (elementsToAni: NodeListOf<HTMLElement>) => {
  if (elementsToAni.length) {
    for (let i = 0; i < elementsToAni.length; i++) {
      if (elementsToAni[i]) {
        const splitValues = new SplitText(elementsToAni[i] as HTMLElement, {
          type: "chars",
          linesClass: "content-char",
          reduceWhiteSpace: false,
        });
        tlNewBlockAniIn.fromTo(
          splitValues.chars,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.05 },
          "<=+0.1",
        );
      }
    }
  }
};

const tlNewBlockAniIn = gsap.timeline({
  onComplete: () => {},
  onUpdate: () => {},
});

async function newLoadingBlock() {
  ethBlocksAnimation.loadingBlockId = new Date().getTime().toString();
  blocks.value.set(
    ethBlocksAnimation.loadingBlockId,
    generateLoadingBlockData(ethBlocksAnimation.loadingBlockId),
  );
  await nextTick();
  tlNewBlockAniIn.to(".eth-block.block-loading", {
    duration: 0.2,
    height: "10px",
  });
  tlNewBlockAniIn.to(".eth-block.block-loading", {
    width: "423px",
    duration: 0.3,
  });
  tlNewBlockAniIn.to(".eth-block.block-loading .block-loading-progress", {
    width: "100%",
    duration: ethBlocksAnimation.blockLoadingTime,
  });
}

function addNewBlockEl(
  el: Element | ComponentPublicInstance | null,
  blockId: string,
) {
  const block = blocks.value.get(blockId);
  if (block && !block.elRef) {
    block.elRef = el;
  }
}

const animateNewBlockAdded = (blockId: string) => {
  const block = blocks.value.get(blockId);
  if (!block) return;
  const el = block.elRef as HTMLElement;
  if (!el) return;

  tlNewBlockAniIn.progress(1);
  tlNewBlockAniIn.to(el.querySelector(".block-loading-progress"), {
    width: "100%",
    duration: 0.2,
    opacity: 0,
    onComplete: () => {
      newLoadingBlock();
    },
  });

  tlNewBlockAniIn.fromTo(
    el,
    { height: 0 },
    { height: "236px", duration: 0.95, marginTop: "20px" },
  );

  const valuesElementsIndex0 = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value.ani-index-0",
  );
  aniContentValues(valuesElementsIndex0);

  const valuesElementsIndex1 = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value.ani-index-1",
  );
  aniContentValues(valuesElementsIndex1);

  tlNewBlockAniIn.to(el.querySelector(".block-loading-progress"), {
    width: 0,
    duration: 0,
    opacity: 1,
    onComplete: () => {},
  });
  tlNewBlockAniIn.play();
};

const { data: initialBlocks } = await useFetch(
  "/api/playground/eth-blocks/latest",
);
initialBlocks.value?.forEach((raw: BlockExtended, index: number) => {
  const block = deserializeBlock(raw);
  const blockId = new Date().getTime().toString() + `_latest_${index}`;
  blocks.value.set(blockId, generateBlockData(block, blockId));
});

let eventSource: EventSource;

ethBlocksAnimation.loadingBlockId = new Date().getTime().toString() + "_first";

const maxBlocks = 50;
const addBlockListener = () => {
  eventSource = new EventSource("/api/playground/eth-blocks/watch");
  eventSource.onmessage = async ({ data }) => {
    const block = deserializeBlock(JSON.parse(data));
    blocks.value.set(
      ethBlocksAnimation.loadingBlockId,
      generateBlockData(block, ethBlocksAnimation.loadingBlockId),
    );
    await nextTick();
    animateNewBlockAdded(ethBlocksAnimation.loadingBlockId);
    if (blocks.value.size > maxBlocks) {
      const oldestKey = blocks.value.keys().next().value;
      if (oldestKey) blocks.value.delete(oldestKey);
    }
  };
};

onUnmounted(() => eventSource?.close());

function enterAni() {
  tlNewBlockAniIn.clear();
  tlNewBlockAniIn.to(".eth-block", {
    width: "423px",
    height: "200px",
    marginTop: "20px",
  });
}

onMounted(async () => {
  addBlockListener();
  if (ethBlocks.value) {
    ethBlocksAnimation.init(ethBlocks.value);
    blocksBasePosition.value = ethBlocksAnimation.blocksBasePosition;
  }
  enterAni();
  newLoadingBlock();
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
