<template>
  <div class="page-container">
    <h1 class="heading-1 play-headline">Playground</h1>
    <div class="playground-projects">
      <nuxt-link href="/playground/1">
        <div class="play-1">
          <h3 class="body-l">Shaders playground</h3>
          <p class="body-s">Exploring shaders and 3d geometry equations</p>
          <Canvas3Image
            :options="{
              src: 'images/play/play1.jpg',
              alt: '',
              shaderName: 'play1',
            }"
          />
        </div>
      </nuxt-link>
      <nuxt-link href="/playground/2">
        <div class="play-1">
          <h3 class="body-l">Infinite scroll</h3>
          <p class="body-s">Infinite scroll playground</p>
          <Canvas3Image
            :options="{
              src: 'images/play/play1.jpg',
              alt: '',
              shaderName: 'play1',
            }"
          />
        </div>
      </nuxt-link>
      <nuxt-link href="/playground/crypto">
        <div class="play-1">
          <h3 class="body-l">Ethereum network</h3>
          <p class="body-s">Ethereum network listener interaction</p>
          <Canvas3Image
            :options="{
              src: 'images/play/play1.jpg',
              alt: '',
              shaderName: 'play1',
            }"
          />
        </div>
      </nuxt-link>
    </div>
  </div>
</template>
<script setup>
// import { onMounted, watch } from 'vue';

useSeoMeta({
  title: "Tomas Kmet - Web developer - Playground",
  ogTitle: "Tomas Kmet - Web developer - Playground",
  description: "Tomas Kmet - Web developer - Playground",
  ogDescription: "Tomas Kmet - Web developer - Playground",
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
.page-container {
  //min-height: 100vh;
}
.play-headline {
  text-transform: capitalize;
  text-align: center;
  padding-top: 100px;
  opacity: 0;
  padding-bottom: 0px;
  margin-bottom: 0px;
  line-height: 190px;
}

.playground-projects {
  position: relative;
}
.play-1 {
  margin-left: 200px;
  width: 500px;
  max-width: 100%;
  @include respond-width($w-m) {
    margin-left: 50px;
  }
  @include respond-width($w-xs) {
    margin-left: 10px;
  }
}
</style>
