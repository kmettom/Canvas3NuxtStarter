<template>
  <div class="eth-blocks-page page-container">
    <div class="eth-blocks">
      <div
        v-for="[blockId, block] in [...blocks].reverse()"
        :key="blockId"
        class="eth-block"
        :class="`${block.inProgress ? ' block-in-progress' : ''}`"
        @mouseenter="hoverBlock($event, true)"
        @mouseleave="hoverBlock($event, false)"
      >
        <div v-if="block.inProgress" class="content-wrapper">
          <div class="block-loader">Block incoming</div>
        </div>
        <div v-else class="content-wrapper">
          <div class="content-row">
            <div class="content-block">
              <span class="content-title">Transactions:</span>
              <span class="content-value">{{ block.transactions.length }}</span>
            </div>
            <div class="content-block">
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
import { onMounted } from "vue";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import {
  blockETHBurned,
  blockGasTargetPercent,
  blockGasUsedPercent,
  blockWithdrawalsSum,
} from "~/utils/play/play-eth-blocks";
import { gsap } from "gsap";

const maxBlocks = 10;

const hoverBlock = (event, status) => {
  const titles = event.target.querySelectorAll(".content-title");
  if (titles.length < 1) return;
  const tl = gsap.timeline({});
  tl.to(titles, { opacity: status ? 1 : 0 });
};

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const blocks = ref(new Map());
const defaultBlockTimeAverage = 12;
const averageBlockTime = ref(defaultBlockTimeAverage);

const generateBlockData = (blockData) => {
  const newBlock = blockData;
  newBlock.blockGasUsedPercent = blockGasUsedPercent(
    newBlock.gasLimit,
    newBlock.gasUsed,
  );
  newBlock.blockGasTargetPercent = blockGasTargetPercent(
    newBlock.gasLimit,
    newBlock.gasUsed,
  );
  const blockWithdrawalsSumVal = blockWithdrawalsSum(newBlock.withdrawals);
  newBlock.blockWithdrawalsSum = blockWithdrawalsSumVal;
  const blockETHBurnedVal = blockETHBurned(
    newBlock.baseFeePerGas,
    newBlock.gasUsed,
  );
  newBlock.blockETHBurned = blockETHBurnedVal;
  newBlock.blockNetIssuanceETH = blockWithdrawalsSumVal - blockETHBurnedVal;
  newBlock.inProgress = false;
  return newBlock;
};

let unwatchBlocks: () => void;
const emptyLoadingBlock = { inProgress: true };

const nextBlockRefIdGenerated = ref(crypto.randomUUID());

const animateNewBlockInProgress = () => {
  console.log("animateNewBlockInProgress");
  const tl = gsap.timeline({});
  setTimeout(() => {
    tl.fromTo(
      ".block-in-progress",
      { height: 0 },
      { height: "200px", duration: averageBlockTime.value },
    );
  }, 10);
};

const addBlockListener = () => {
  nextBlockRefIdGenerated.value = crypto.randomUUID();
  blocks.value.set(nextBlockRefIdGenerated.value, emptyLoadingBlock);

  unwatchBlocks = client.watchBlocks({
    onBlock: (block) => {
      blocks.value.set(nextBlockRefIdGenerated.value, generateBlockData(block));
      if (blocks.value.size > maxBlocks) {
        unwatchBlocks();
        return;
      }
      nextBlockRefIdGenerated.value = crypto.randomUUID();
      blocks.value.set(nextBlockRefIdGenerated.value, emptyLoadingBlock);
      animateNewBlockInProgress();
    },
  });
};

const getLastBlock = async () => {
  const latestBlockNumber = await client.getBlockNumber();
  const latestBlock = await client.getBlock({ latestBlockNumber });
  blocks.value.set(
    nextBlockRefIdGenerated.value,
    generateBlockData(latestBlock),
  );
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

.eth-block {
  height: 200px;
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
