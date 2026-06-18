<script setup lang="ts">
import { formatEth2 } from "~/utils/playground/eth-blocks/web3-helpers";
import ProgressBar from "~/components/playground/eth-blocks/progressBar.vue";
import BurnedIcon from "~/components/playground/eth-blocks/icons/burnedIcon.vue";
import WithdrawIcon from "~/components/playground/eth-blocks/icons/withdrawIcon.vue";
import SupplyIcon from "~/components/playground/eth-blocks/icons/supplyIcon.vue";
import GasChart from "~/components/playground/eth-blocks/gasChart.vue";

const props = defineProps<{
  block: BlockExtended;
}>();
</script>

<template>
  <div class="block-loading-progress" />
  <div v-if="props.block.loading" />
  <div v-else class="content-wrapper">
    <div class="content-row">
      <div class="content-block">
        <div class="content-title ani-index-title">Transactions:</div>
        <div class="content-value ani-index-0-counter eth-large-text">
          {{ block.transactions.length }}
        </div>
      </div>
      <div class="content-block">
        <div class="content-title gas ani-index-title">Gas:</div>
        <div class="gas-block">
          <div class="gas-chart">
            <gas-chart :gas-value="Number(block.blockGasUsedPercent ?? 0)" />
          </div>
          <div class="gas-stats">
            <div class="gas-stat-line">
              <span class="ani-index-title"> Gas used: </span>
              <span class="ani-index-0">
                {{ block.blockGasUsedPercent + "%" }}
              </span>
            </div>
            <div class="">
              <span class="ani-index-title"> Gas target: </span>
              <span class="ani-index-0">
                {{ block.blockGasTargetPercent }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-row row-wrap">
      <div v-if="block.blockETHBurned" class="content-block supply">
        <burnedIcon />
        <span class="ani-index-title">Burned:</span>
        <span class="content-value ani-index-0">
          {{ formatEth2(block.blockETHBurned) }}
        </span>
        <span class="content-value ani-index-1">ETH</span>
        <progressBar :progress-percent="20" />
      </div>
      <div v-if="block.blockWithdrawalsSum" class="content-block supply">
        <withdrawIcon />
        <span class="content-title ani-index-title">Withdrawed:</span>
        <span class="content-value ani-index-0">
          {{ formatEth2(block.blockWithdrawalsSum) }}
        </span>
        <span class="content-value ani-index-1">ETH</span>
        <progressBar :progress-percent="20" />
      </div>
      <div v-if="block.blockNetIssuanceETH" class="content-block supply">
        <supplyIcon />
        <span class="content-title ani-index-title">Supply Delta:</span>
        <span class="content-value ani-index-0 text-bold">
          {{ formatEth2(block.blockNetIssuanceETH) }}
        </span>
        <span class="content-value ani-index-1 text-bold">ETH</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.eth-base-text {
  font-size: 12px;
}

.eth-large-text {
  font-size: 50px;
  font-weight: 900;
}

.block-loading-progress {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.content-wrapper {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px 0;
}

.content-row {
  padding: 15px 30px;
  justify-items: start;
  justify-content: space-between;
  display: flex;

  &.row-wrap {
    flex-wrap: wrap;
  }
}

.content-block {
  &.supply {
    width: 50%;

    &:last-child {
      margin-top: 20px;
    }

    svg {
      position: relative;
      top: 3px;
      margin-right: 8px;
    }
  }
}

.content-title {
  padding-right: 10px;
  &.gas {
    padding-bottom: 8px;
  }
}

.gas-block {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gas-chart {
  padding-right: 15px;
}

.gas-stat-line {
  margin-bottom: 13px;
}

.text-bold {
  font-weight: bold;
}
</style>
