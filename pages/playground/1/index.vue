<template>
  <div class="page-container">
    <h1 class="headline">
      <CanvasText :theme="'light'" :uniforms="mainTextInUniforms">
        1
      </CanvasText>
    </h1>
    <div ref="play1el" class="play1-el" />
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { addObjectPlay1 } from '~/utils/play/play1';

useSeoMeta({
  title: 'Tomas Kmet - Web developer - Playground',
  ogTitle: 'Tomas Kmet - Web developer - Playground',
  description: 'Tomas Kmet - Web developer - Playground',
  ogDescription: 'Tomas Kmet - Web developer - Playground',
});

const mainTextInUniforms = {
  uAniInText: { value: 1, duration: 1 },
};

const play1el = ref('play1el');

onMounted(() => {
  setTimeout(() => {
    addObjectPlay1(play1el.value, { uAniInImage: { value: 1, duration: 1 } });
  }, 1000);
});
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
