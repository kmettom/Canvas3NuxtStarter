<template>
  <div class="eth-blocks-page page-container">
    <div class="eth-blocks">
      <div
        v-for="[blockId, block] in [...blocks].reverse()"
        :key="blockId"
        class="eth-block"
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
import { createPublicClient, http, hexToNumber } from "viem";
import { sepolia } from "viem/chains";
// import { BlockExample } from "~/pages/playground/eth-blocks/block-example";

const maxBlocks = 10;

const blockWithdrawalsSum = (withdrawals) => {
  let sum = 0;
  for (let i = 0; i < withdrawals.length; i++) {
    const withNum = hexToNumber(withdrawals[i].amount);
    sum += withNum;
  }
  return sum;
};

const blockETHBurned = (baseFeePerGas, gasUsed) => {
  const baseFeePerGasNum = hexToNumber(baseFeePerGas);
  const gasUsedNum = hexToNumber(gasUsed);

  return baseFeePerGasNum * gasUsedNum;
};

const blockGasUsedPercent = (gasLimit, gasUsed) => {
  const gasUsedNum = hexToNumber(gasUsed);
  const gasLimitNum = hexToNumber(gasLimit);

  return Number((gasUsedNum / gasLimitNum) * 100).toFixed(2) + "%";
};

const blockGasTargetPercent = (gasLimit, gasUsed) => {
  const gasUsedNum = hexToNumber(gasUsed);
  const gasLimitNum = hexToNumber(gasLimit);
  const gasTargetZeroPoint = gasLimitNum / 2;
  const gasTargetCoef = (gasUsedNum - gasTargetZeroPoint) / gasTargetZeroPoint;

  return Number(gasTargetCoef * 100).toFixed(2) + "%";
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

const addBlockListener = () => {
  nextBlockRefIdGenerated.value = crypto.randomUUID();
  blocks.value.set(nextBlockRefIdGenerated.value, emptyLoadingBlock);

  console.log("blocks.value", blocks.value);

  unwatchBlocks = client.watchBlocks({
    onBlock: (block) => {
      blocks.value.set(nextBlockRefIdGenerated.value, generateBlockData(block));
      if (blocks.value.size > maxBlocks) {
        unwatchBlocks();
        return;
      }
      nextBlockRefIdGenerated.value = crypto.randomUUID();
      blocks.value.set(nextBlockRefIdGenerated.value, emptyLoadingBlock);
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
    padding-right: 10px;
  }
}

.eth-block-image {
  width: 100%;
  //height: 200px;
}
</style>

<!--TODO:-->
<!-- ->Navigation update  -->
<!-- ->Playground main page finish  -->
<!-- ->Page transition - easy overlay 1st version ->   -->
<!-- ->Playground eth - animation in  -->
<!-- ->Playground eth - block loading time - avegage block time loading - shader slowly loading + loader text  -->
