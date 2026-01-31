<template>
  <div class="page-container">
    <h1 class="headline">
      ETHEREUM - {{ currentBlock?.transactions.length }}
    </h1>
    <div class="block" v-for="block in blocks">
      <div>
        {{ block.transactions.length }}
      </div>
      <CanvasImage :src-link="'images/play/play1.jpg'"/>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const blocks = ref([]);
const currentBlock = ref(null);
let unwatchBlocks;

onMounted(async () => {
  // blockNumber.value = await client.getBlockNumber();
  // currentBlock.value = await client.getBlock();
  // console.log('block', currentBlock.value);

  unwatchBlocks = client.watchBlocks(
      { onBlock: block => {
          blocks.value.push(block);
          console.log("block" , block);
          currentBlock.value = block
        } },
  )

});

onUnmounted(() => {
  unwatchBlocks();
})
</script>
<style lang="scss" scoped>
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
