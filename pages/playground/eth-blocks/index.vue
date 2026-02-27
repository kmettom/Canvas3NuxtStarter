<template>
  <div class="eth-blocks-page page-container">
    <div class="block-in-progress-loader" />
    <div class="eth-blocks">
      <div
        v-for="block in blocksToRender"
        :key="block.timestamp.toString()"
        :ref="(el) => animateNewBlockAdded(el, block.timestamp.toString())"
        class="eth-block"
        @mouseenter="hoverBlock($event, true, block.timestamp.toString())"
        @mouseleave="hoverBlock($event, false, block.timestamp.toString())"
      >
        <div class="content-wrapper">
          <div class="content-row">
            <div class="content-block">
              <span class="content-title">Transactions:</span>
              <span class="content-value ani-index-0">{{
                block.transactions.length
              }}</span>
            </div>
            <div class="content-block">
              <span class="content-title">Gas used:</span>
              <span class="content-value ani-index-0">{{
                block.blockGasUsedPercent
              }}</span>
            </div>
            <div class="content-block">
              <span class="content-title">Gas target:</span>
              <span class="content-value ani-index-0">{{
                block.blockGasTargetPercent
              }}</span>
            </div>
          </div>
          <div class="content-row">
            <div v-if="block.blockETHBurned" class="content-block">
              <span class="content-title">Burned</span>
              <span class="content-value ani-index-0">
                {{ formatEth2(block.blockETHBurned) }}</span
              >
              <span class="content-value ani-index-1">ETH</span>
            </div>
            <div v-if="block.blockWithdrawalsSum" class="content-block">
              <span class="content-title">Withdrawed:</span>
              <span class="content-value ani-index-0">
                {{ formatEth2(block.blockWithdrawalsSum) }}</span
              >
              <span class="content-value ani-index-1">ETH</span>
            </div>
            <div v-if="block.blockNetIssuanceETH" class="content-block">
              <span class="content-title">Supply Delta Δ:</span>
              <span class="content-value ani-index-0">
                {{ formatEth2(block.blockNetIssuanceETH) }}</span
              >
              <span class="content-value ani-index-1">ETH</span>
            </div>
          </div>
        </div>
        <!--        src: '/images/play/playeth-example-block.png',-->
        <img
          v-canvas3-image="{
            uniforms: {
              uAniInImage: {
                value: block.blockAniIn ? 1 : 0,
                duration: 0.75,
                ease: 'linear',
              },
              uBlockColor: {
                value: block.blockGasTargetCoef ?? 0,
                duration: 0.5,
                ease: 'linear',
              },
              uBlocks: {
                value: block.transactions.length,
                duration: 0,
                ease: 'linear',
              },
              uHover: {
                value: block.blockHovered ? 1 : 0,
                duration: 0.5,
                ease: 'linear',
              },
            },
            shaderName: 'playEthBlock',
          }"
          :src="`/images/${block.imageId}.JPG`"
          alt=""
          class="eth-block-image"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import { createPublicClient, http } from "viem";
import {mainnet} from "viem/chains";
import {
  formatEth2,
  generateBlockData,
  type BlockExtended,
} from "~/utils/play/play-eth-blocks";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const maxBlocks = 10;

const blocksToRender = computed<BlockExtended[]>(() => {
  return [...blocks.value.values()].sort((a, b) =>
    a.timestamp > b.timestamp ? -1 : 1,
  );
});

const hoverBlock = (event: Event, status: boolean, blockTimestamp: string) => {
  const target = event.target as Element;
  const titles = target.querySelectorAll(".content-title");
  if (titles.length < 1) return;
  const tl = gsap.timeline({});
  tl.to(titles, { opacity: status ? 1 : 0 });

  tl.call(
    () => {
      const blockToAnimate = blocks.value.get(blockTimestamp);
      if (blockToAnimate) {
        blockToAnimate.blockHovered = status;
      }
    },
    undefined,
    "<",
  );
};

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const blocks = ref<Map<string, BlockExtended>>(new Map());
const defaultBlockTimeAverage = 15;
const averageBlockTime = ref(defaultBlockTimeAverage);

let unwatchBlocks: () => void;

const tlInProgress = gsap.timeline({
  onStart: () => {
    Canvas3.setMeshPositionsUpdate(true);
  },
  onComplete: () => {
    Canvas3.setMeshPositionsUpdate(false);
  },
});

const animateNewBlockInProgress = () => {
  tlInProgress.clear();
  tlInProgress.fromTo(
    ".block-in-progress-loader",
    { width: 0 },
    { width: "100%", duration: averageBlockTime.value },
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
  onComplete: () => {
    // console.log("tlNewBlockAniIn onComplete")
    // animateNewBlockInProgress();
  },
});

const animateNewBlockAdded = (
  target: Element | ComponentPublicInstance | null,
  blockTimestamp: string,
) => {
  if (!target) return;
  const el = target as Element;
  if (el.classList.contains("block-added")) return;

  tlNewBlockAniIn.fromTo(
    el,
    { height: 0 },
    { height: "200px", duration: 0.35 },
  );

  tlNewBlockAniIn.call(
    () => {
      const blockToAnimate = blocks.value.get(blockTimestamp);
      if (blockToAnimate) {
        blockToAnimate.blockAniIn = true;
      }
    },
    undefined,
    "<=+0.1",
  );

  const valuesElementsIndex0 = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value.ani-index-0",
  );
  aniContentValues(valuesElementsIndex0);

  const valuesElementsIndex1 = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value.ani-index-1",
  );
  aniContentValues(valuesElementsIndex1);

  animateNewBlockInProgress();

  tlNewBlockAniIn.play();
  el.classList.add("block-added");
};

const addBlockListener = () => {
  unwatchBlocks = client.watchBlocks({
    onBlock: async (block) => {
      if (blocks.value.has(block.timestamp.toString())) return;
      blocks.value.set(block.timestamp.toString(), generateBlockData(block));
      await nextTick();
      //TODO: remove? or set to 100?
      if (blocks.value.size > maxBlocks) {
        unwatchBlocks();
        return;
      }
    },
  });
};

const NUM_LAST_BLOCKS = 3;

const getLastBlocks = async () => {
  const latestBlockNumber = await client.getBlockNumber();

  const blockNumbers = Array.from(
    { length: NUM_LAST_BLOCKS },
    (_, i) => latestBlockNumber - BigInt(i),
  );

  const blocksResult = await Promise.all(
    blockNumbers.map((blockNumber) => client.getBlock({ blockNumber })),
  );

  blocksResult.forEach((block) => {
    blocks.value.set(block.timestamp.toString(), generateBlockData(block));
  });

  await nextTick();
};

onMounted(async () => {
  await getLastBlocks();
  addBlockListener();
});

onUnmounted(() => {
  if (unwatchBlocks) {
    unwatchBlocks();
  }
});
</script>
<style lang="scss" scoped>
.eth-blocks-page {
  padding-top: 100px;
}

.block-in-progress-loader {
  height: 6px;
  width: 0;
  background: var(--light-color);
  position: relative;
}

.eth-block {
  overflow: hidden;
  height: 0;
  width: 100%;
  display: inline-block;
  position: relative;

  .content-wrapper {
    z-index: 10;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  .content-row {
    justify-items: center;
    align-items: center;
    justify-content: space-between;
    display: flex;
  }

  .content-block {
    display: flex;
    justify-content: center;
    align-items: baseline;
    padding: 25px;
  }

  .content-title {
    opacity: 0;
    padding-right: 10px;
  }

  .content-char {
    opacity: 0;
  }
}

.eth-block-image {
  width: 100%;
  height: 200px;
  opacity: 0;
}
</style>
