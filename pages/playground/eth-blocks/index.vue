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
              <span class="content-value">{{ block.transactions.length }}</span>
            </div>
            <div v-if="block.withdrawals" class="content-block">
              <span class="content-title">Withdrawals:</span>
              <span class="content-value">{{ block.withdrawals.length }}</span>
            </div>
            <div class="content-block">
              <span class="content-title">Gas used:</span>
              <span class="content-value">{{ block.blockGasUsedPercent }}</span>
            </div>
            <div class="content-block">
              <span class="content-title">Gas target:</span>
              <span class="content-value">{{
                block.blockGasTargetPercent
              }}</span>
            </div>
          </div>
          <div class="content-row">
            <div v-if="block.blockETHBurned" class="content-block">
              <span class="content-title">Burned ETH:</span>
              <span class="content-value">{{
                formatEther(block.blockETHBurned)
              }}</span>
            </div>
            <div v-if="block.blockWithdrawalsSum" class="content-block">
              <span class="content-title">∑ Withdrawals:</span>
              <span class="content-value">{{
                formatEther(block.blockWithdrawalsSum)
              }}</span>
            </div>
            <div v-if="block.blockNetIssuanceETH" class="content-block">
              <span class="content-title">ETH burn vs issuance:</span>
              <span class="content-value">{{
                formatEther(block.blockNetIssuanceETH)
              }}</span>
            </div>
          </div>
        </div>
        <img
          src="/images/play/playeth-example-block.png"
          alt=""
          class="eth-block-image"
          v-canvas3-image="{
            src: '/images/play/playeth-example-block.png',
            alt: '',
            loadStrategy: 'preload',
            uniforms: {
              uAniInImage: {
                value: block.blockAniIn ? 1 : 0,
                duration: 2.5,
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
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import { createPublicClient, formatEther, http } from "viem";
import { sepolia } from "viem/chains";
import {
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
  chain: sepolia,
  transport: http(),
});

const blocks = ref<Map<string, BlockExtended>>(new Map());
const defaultBlockTimeAverage = 15;
const averageBlockTime = ref(defaultBlockTimeAverage);

let unwatchBlocks: () => void;

const tlInProgress = gsap.timeline({});

const animateNewBlockInProgress = () => {
  tlInProgress.clear();
  tlInProgress.fromTo(
    ".block-in-progress-loader",
    { width: 0 },
    { width: "100%", duration: averageBlockTime.value },
  );
};
const tlNewBlockAniIn = gsap.timeline({});
const animateNewBlockAdded = (
  target: Element | ComponentPublicInstance | null,
  blockTimestamp: string,
) => {
  if (!target) return;
  const el = target as Element;
  if (el.classList.contains("block-added")) return;

  tlNewBlockAniIn.fromTo(el, { height: 0 }, { height: "200px", duration: 0.4 });

  const valuesElements = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value",
  );

  if (valuesElements.length) {
    for (let i = 0; i < valuesElements.length; i++) {
      if (valuesElements[i]) {
        const splitValues = new SplitText(valuesElements[i] as HTMLElement, {
          type: "chars",
          linesClass: "content-char",
          reduceWhiteSpace: false,
        });
        tlNewBlockAniIn.fromTo(
          splitValues.chars,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, stagger: 0.05 },
          "<=+0.4",
        );
      }
    }
  }

  tlNewBlockAniIn.call(
    () => {
      const blockToAnimate = blocks.value.get(blockTimestamp);
      if (blockToAnimate) {
        blockToAnimate.blockAniIn = true;
      }
    },
    undefined,
    "<=+0.3",
  );

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
      animateNewBlockInProgress();
    },
  });
};

const getLastBlock = async () => {
  const latestBlockNumber = await client.getBlockNumber();
  const latestBlock = await client.getBlock({ blockNumber: latestBlockNumber });
  blocks.value.set(
    latestBlock.timestamp.toString(),
    generateBlockData(latestBlock),
  );
  await nextTick();
  animateNewBlockInProgress();
};

onMounted(async () => {
  await getLastBlock();
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
  border: 4px solid grey;
  height: 0;
  width: 0;
  position: absolute;
  top: 0;
  left: 0;
}

.eth-block {
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
}
</style>

<!--TODO:-->
<!-- ->Playground eth - layout  -->
<!-- ->Playground eth - block loading time - avegage block time loading - shader slowly loading + loader text  -->
<!-- ->Playground main page finish  -->
<!-- ->Page transition - easy overlay 1st version ->   -->
