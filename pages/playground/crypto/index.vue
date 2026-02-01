<template>
  <div class="eth-blocks-page page-container">
    <h1 class="headline">ETHEREUM - {{ currentBlock?.transactions.length }}</h1>

    <div class="eth-blocks">

    <div v-for="block in blocks" :key="block.transactions.length" class="eth-block">
      <div>
        {{ block.transactions.length }}
      </div>
      <Canvas3Image
          class="eth-block-image"
          :options="{
          src: '/images/08.JPG',
          alt: 'background wave on beach',
          loadStrategy: 'preload',
          uniforms: imageUniforms,
          shaderName: 'play1',
        }"
      />
    </div>
    </div>

  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const blocks = ref([]);
const currentBlock = ref(null);
let unwatchBlocks;

const imageUniforms = computed(() => {
  return {
    uAniInImage: { value: 1 , duration: 1.25 },
  };
});

onMounted(async () => {
  // blockNumber.value = await client.getBlockNumber();
  // currentBlock.value = await client.getBlock();
  // console.log('block', currentBlock.value);

  unwatchBlocks = client.watchBlocks({
    onBlock: (block) => {
      blocks.value.push(block);
      console.log("block", block);
      currentBlock.value = block;
    },
  });
});

onUnmounted(() => {
  unwatchBlocks();
});
</script>
<style lang="scss" scoped>
.eth-blocks-page {
  padding-top: 300px;
}

.eth-block{
  height: 33vh;
}
.eth-block-image{
  height: 100%;
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
