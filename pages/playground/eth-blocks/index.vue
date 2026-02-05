<template>
  <div class="eth-blocks-page page-container">
    <!--    <div class="eth-first-block-preload">-->
    <!--    </div>-->
    <div class="eth-blocks">
      <div
        v-for="block in blocks"
        :key="block.transactions.length"
        class="eth-block"
      >
        <div>
          <div>Transactions: {{ block.transactions.length }}</div>
          <div>Withdrawals: {{ block.withdrawals.length }}</div>
          <div>GasUsed: {{ block.blockGasUsedPercent }}</div>
          <div>
            Gas target:
            {{ block.blockGasTargetPercent }}
          </div>
          <div>burned ETH: {{ block.blockETHBurned }}</div>
          <div>∑ withdrawals: {{ block.blockWithdrawalsSum }}</div>
          <div>ETH BURN vs issue: {{ block.blockNetIssuanceETH }}</div>
        </div>
        <Canvas3Image
          class="eth-block-image"
          :options="{
            src: '/images/08.JPG',
            alt: 'background wave on beach',
            loadStrategy: 'preload',
            uniforms: 'playEthBlock',
          }"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { createPublicClient, http, hexToNumber } from "viem";
import { sepolia } from "viem/chains";
import { BlockExample } from "~/pages/playground/eth-blocks/block-example";

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

const blocks = ref([]);

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

  return newBlock;
};

let unwatchBlocks;

const addBlockListener = () => {
  const block = BlockExample.result;
  const newBlockWithData = generateBlockData(block);
  blocks.value.push(newBlockWithData);

  // unwatchBlocks = client.watchBlocks({
  //   onBlock: (block) => {
  //     const newBlockWithData = generateBlockData(block);
  //     blocks.value.push(newBlockWithData);
  //     if(blocks.value.length > 10) {
  //       unwatchBlocks();
  //     }
  //   },
  // });
};

onMounted(async () => {
  addBlockListener();
});

onUnmounted(() => {
  unwatchBlocks();
});
</script>
<style lang="scss" scoped>
.eth-blocks-page {
  padding-top: 300px;
}

.eth-block {
  border: 1px solid red;
  height: 33vh;
  width: 100%;
  position: relative;
}

.eth-block-image {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

.play-1-img-wrapper {
  margin-left: 200px;
  width: 700px;
}

.play1-el {
  margin: 100px;
  width: 300px;
  height: 300px;
  //border: 1px solid green;
}
</style>
