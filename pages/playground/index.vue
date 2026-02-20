<template>
  <div class="page-container">
    <h1 class="heading-1 play-headline">Playground</h1>
    <div class="playground-projects">
      <!--      <nuxt-link href="/playground/1">-->
      <!--        <div class="play-1">-->
      <!--          <h3 class="body-l">Shaders playground</h3>-->
      <!--          <p class="body-s">Exploring shaders and 3d geometry equations</p>-->
      <!--          <Canvas3Image-->
      <!--            :options="{-->
      <!--              src: 'images/play/play1.JPG',-->
      <!--              alt: '',-->
      <!--              shaderName: 'play1',-->
      <!--            }"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </nuxt-link>-->
      <!--      <nuxt-link href="/playground/2">-->
      <!--        <div class="play-1">-->
      <!--          <h3 class="body-l">Infinite scroll</h3>-->
      <!--          <p class="body-s">Infinite scroll playground</p>-->
      <!--          <Canvas3Image-->
      <!--            :options="{-->
      <!--              src: 'images/play/play1.JPG',-->
      <!--              alt: '',-->
      <!--              shaderName: 'play1',-->
      <!--            }"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </nuxt-link>-->
      <nuxt-link class="play-link" href="/playground/eth-blocks">
        <div
          class="play-1"
          @mouseenter="ethBlockHover = true"
          @mouseleave="ethBlockHover = false"
        >
          <h3 class="body-l">Ethereum blocks</h3>
          <p class="body-s">
            Ethereum network listener with interaction for new blocks added to
            the blockchain
          </p>
          <img
            v-canvas3-image="{
              loadStrategy: 'preload',
              uniforms: {
                uAniInImage: {
                  value: ethBlockImageAniIn ? (ethBlockHover ? 0.85 : 1) : 0,
                  duration: 0.5,
                  ease: 'linear',
                },
                uBlockColor: {
                  value: ethBlockHover ? 0.6 : 0.5,
                  duration: 0.5,
                  ease: 'linear',
                },
                uBlocks: {
                  value: 10,
                  duration: 0,
                  ease: 'linear',
                },
                uHover: {
                  value: 1,
                  duration: 0.5,
                  ease: 'linear',
                },
              },
              shaderName: 'playEthBlock',
            }"
            :src="`/images/01.JPG`"
            alt=""
            class="play-block-image"
          />
        </div>
      </nuxt-link>
    </div>
  </div>
</template>
<script setup>
import { pageTransition } from "~/utils/animations/pageTransition";

useSeoMeta({
  title: "Canvas3 - Playground",
  ogTitle: "Canvas3 - Playground",
  description: "Canvas3 - Playground",
  ogDescription: "Canvas3 - Playground",
});

const navigationStore = useNavigationStore();

const ethBlockImageAniIn = ref(false);
const ethBlockHover = ref(false);

onMounted(() => {
  const timeDelay = navigationStore.webFirstLoadDone
    ? pageTransition.setup.duration * 2500
    : 100;

  setTimeout(() => {
    ethBlockImageAniIn.value = true;
  }, timeDelay);
});
</script>
<style lang="scss" scoped>
.play-link {
  color: inherit;
  text-decoration: none;
}
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
.play-block-image {
  margin-top: 15px;
  width: 450px;
}
</style>
