<template>
  <div class="eth-blocks-page page-container">
    <div class="block-in-progress" />
    <div class="eth-blocks">
      <div
        v-for="block in blocksToRender"
        :key="block.timestamp.toString()"
        :ref="(el) => animateNewBlockAdded(el)"
        class="eth-block"
        @mouseenter="hoverBlock($event, true)"
        @mouseleave="hoverBlock($event, false)"
      >
        <div class="content-wrapper">
          <div class="content-row">
            <div class="content-block">
              <span class="content-title">Transactions:</span>
              <span class="content-value">{{ block.transactions.length }}</span>
            </div>
            <div class="content-block" v-if="block.withdrawals">
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
            <div class="content-block">
              <span class="content-title">Burned ETH:</span>
              <span class="content-value">{{ block.blockETHBurned }}</span>
            </div>
            <div class="content-block">
              <span class="content-title">∑ Withdrawals:</span>
              <span class="content-value">{{ block.blockWithdrawalsSum }}</span>
            </div>
            <div class="content-block">
              <span class="content-title">ETH burn vs issuance:</span>
              <span class="content-value">{{ block.blockNetIssuanceETH }}</span>
            </div>
          </div>
        </div>
        <!--        <Canvas3Image-->
        <!--          class="eth-block-image"-->
        <!--          :options="{-->
        <!--            src: '/images/play/playeth-example-block.png',-->
        <!--            alt: 'background wave on beach',-->
        <!--            loadStrategy: 'preload',-->
        <!--            uniforms: {-->
        <!--              uAniInImage: { value: 1, duration: 0 },-->
        <!--            },-->
        <!--            shaderName: 'playEthBlock',-->
        <!--          }"-->
        <!--        />-->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import {
  generateBlockData,
  type BlockExtended,
} from "~/utils/play/play-eth-blocks";
import { gsap } from "gsap";

const maxBlocks = 10;

const blocksToRender = computed<BlockExtended[]>(() => {
  return [...blocks.value.values()].sort((a, b) =>
    a.timestamp > b.timestamp ? -1 : 1,
  );
});

const hoverBlock = (event: Event, status: boolean) => {
  const target = event.target as Element;
  const titles = target.querySelectorAll(".content-title");
  if (titles.length < 1) return;
  const tl = gsap.timeline({});
  tl.to(titles, { opacity: status ? 1 : 0 });
};

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const blocks = ref<Map<string, BlockExtended>>(new Map());
const defaultBlockTimeAverage = 12;
const averageBlockTime = ref(defaultBlockTimeAverage);

let unwatchBlocks: () => void;

const tlInProgress = gsap.timeline({});

const animateNewBlockInProgress = () => {
  tlInProgress.clear();
  tlInProgress.fromTo(
    ".block-in-progress",
    { width: 0 },
    { width: "100%", duration: averageBlockTime.value },
  );
};
const tlNewBlockAniIn = gsap.timeline({});
const animateNewBlockAdded = (
  target: Element | ComponentPublicInstance | null,
) => {
  if (!target) return;
  const el = target as Element;
  if (el.classList.contains("block-added")) return;

  tlNewBlockAniIn.fromTo(el, { height: 0 }, { height: "200px", duration: 0.5 });

  const valuesElements = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value",
  );
  if (valuesElements.length) {
    tlNewBlockAniIn.fromTo(
      valuesElements,
      { opacity: 0 },
      { opacity: 1, stagger: 0.1 },
      ">", // after height animation
    );
  }
  tlNewBlockAniIn.play();
  el.classList.add("block-added");
};

const addBlockListener = () => {
  unwatchBlocks = client.watchBlocks({
    onBlock: async (block) => {
      const nextBlockRefIdGenerated = crypto.randomUUID();
      blocks.value.set(nextBlockRefIdGenerated, generateBlockData(block));
      await nextTick();
      // await animateNewBlockAdded(nextBlockRefIdGenerated);
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
  const nextBlockRefIdGenerated = crypto.randomUUID();
  blocks.value.set(nextBlockRefIdGenerated, generateBlockData(latestBlock));
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

.block-in-progress {
  border: 4px solid grey;
  height: 0;
  width: 0;
}

.eth-block {
  height: 50px;
  border: 1px solid red;
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
  .content-value {
    opacity: 0;
  }
}

.eth-block-image {
  width: 100%;
  //height: 200px;
}
</style>

<!--TODO:-->
<!-- ->Playground eth - animation in  -->
<!-- ->Playground eth - block loading time - avegage block time loading - shader slowly loading + loader text  -->
<!-- ->Playground main page finish  -->
<!-- ->Page transition - easy overlay 1st version ->   -->
