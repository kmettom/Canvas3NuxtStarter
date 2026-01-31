<template>
  <div class="page-container">
    <h1 class="heading-1 play-headline">
      <CanvasText
        :theme="'light'"
        :uniforms="{ uAniInText: { active: true, duration: 0 } }"
      >
        Playground
      </CanvasText>
    </h1>
    <div class="playground-projects">
      <nuxt-link href="/playground/1">
        <div class="play-1">
          <h3 class="body-l">Shaders playground</h3>
          <p class="body-s">Exploring shaders and 3d geometry equations</p>
          <CanvasImage :src-link="'images/play/play1.jpg'" :shader="'play1'" />
        </div>
      </nuxt-link>
      <nuxt-link href="/playground/2">
        <div class="play-1">
          <h3 class="body-l">Infinite scroll</h3>
          <p class="body-s">Infinite scroll playground</p>
          <CanvasImage :src-link="'images/play/play1.jpg'" />
        </div>
      </nuxt-link>
      <nuxt-link href="/playground/crypto">
        <div class="play-1">
          <h3 class="body-l">Ethereum network</h3>
          <p class="body-s">Ethereum network listener interaction</p>
          <CanvasImage :src-link="'images/play/play1.jpg'" />
        </div>
      </nuxt-link>
    </div>
  </div>
</template>
<script setup>
// import { onMounted, watch } from 'vue';

useSeoMeta({
  title: 'Tomas Kmet - Web developer - Playground',
  ogTitle: 'Tomas Kmet - Web developer - Playground',
  description: 'Tomas Kmet - Web developer - Playground',
  ogDescription: 'Tomas Kmet - Web developer - Playground',
});
//
// const props = defineProps({
//   pageActive: Boolean,
// });
//
// const pageAnimateIn = () => {
//   // console.log('Example method - animate page transition');
// };
//
// onMounted(() => {
//   if (props.pageActive) {
//     pageAnimateIn();
//   }
// });
//
// watch(
//   () => props.pageActive,
//   (newValue) => {
//     if (newValue) {
//       pageAnimateIn();
//     }
//   },
// );
</script>
<style lang="scss" scoped>
.play-headline {
  padding-top: 150px;
}
.play-1 {
  margin-left: 200px;
  width: 400px;
}
</style>
