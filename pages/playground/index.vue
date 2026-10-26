<template>
  <div class="page-container">
    <h1 class="heading-2 play-headline">Playground</h1>
    <div class="playground-projects">
      <nuxt-link
        class="play-link"
        href="/playground/eth-blocks"
        target="_blank"
      >
        <div
          class="play-link-eth"
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
              uniforms: {
                uAniInImage: {
                  value: ethBlockImageAniIn ? (ethBlockHover ? 0.85 : 1) : 0,
                  duration: 0.5,
                  ease: 'linear',
                },
                uBlockColor: {
                  value: 0.5,
                  duration: 0.5,
                  ease: 'linear',
                },
              },
              shaderName: 'playEthBlockNoDesign',
            }"
            :src="`/images/01.jpg`"
            alt=""
            class="play-block-image"
          />
        </div>
      </nuxt-link>
      <nuxt-link
        class="play-link"
        href="/playground/scroll-performance"
        target="_blank"
      >
        <div
          class="play-link-right"
          @mouseenter="scrollPerformanceHover = true"
          @mouseleave="scrollPerformanceHover = false"
        >
          <h3 class="body-l">Scroll performance</h3>
          <p class="body-s">
            Example of scroll performance with different scroll speed sections
            and shaders
          </p>
          <img
            v-canvas3-image="{
              uniforms: {
                uAniInImage: {
                  value: ethBlockImageAniIn
                    ? scrollPerformanceHover
                      ? 0.85
                      : 1
                    : 0,
                  duration: 0.5,
                  ease: 'linear',
                },
                uBlockColor: {
                  value: 0.5,
                  duration: 0.5,
                  ease: 'linear',
                },
              },
              shaderName: 'playEthBlockNoDesign',
            }"
            :src="`/playground/images/02.webp`"
            alt=""
            class="play-block-image"
          />
        </div>
      </nuxt-link>
      <!--      <nuxt-link-->
      <!--        class="play-link"-->
      <!--        href="/playground/gltf-model"-->
      <!--        target="_blank"-->
      <!--      >-->
      <!--        <div-->
      <!--          class=""-->
      <!--          @mouseenter="gltfModelHover = true"-->
      <!--          @mouseleave="gltfModelHover = false"-->
      <!--        >-->
      <!--          <h3 class="body-l">GLTF Model</h3>-->
      <!--          <p class="body-s">-->
      <!--            GLTF model import, story tell feature with directive and easy to-->
      <!--            setup scroll action-->
      <!--          </p>-->
      <!--          <img-->
      <!--            v-canvas3-image="{-->
      <!--              uniforms: {-->
      <!--                uAniInImage: {-->
      <!--                  value: ethBlockImageAniIn ? (gltfModelHover ? 0.85 : 1) : 0,-->
      <!--                  duration: 0.5,-->
      <!--                  ease: 'linear',-->
      <!--                },-->
      <!--                uBlockColor: {-->
      <!--                  value: 0.5,-->
      <!--                  duration: 0.5,-->
      <!--                  ease: 'linear',-->
      <!--                },-->
      <!--              },-->
      <!--              shaderName: 'playEthBlockNoDesign',-->
      <!--            }"-->
      <!--            :src="`/playground/images/03.webp`"-->
      <!--            alt=""-->
      <!--            class="play-block-image"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </nuxt-link>-->
    </div>
  </div>
</template>
<script setup lang="ts">
import { pageTransition } from "~/utils/animations/pageTransition";
import { onMounted } from "vue";

useSeoMeta({
  title: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogTitle: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  description: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogDescription: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
});

const navigationStore = useNavigationStore();

const ethBlockImageAniIn = ref(false);
const ethBlockHover = ref(false);
const scrollPerformanceHover = ref(false);
// const gltfModelHover = ref(false);

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
  padding-bottom: 0;
  margin-bottom: 0;
  line-height: 190px;
}

.playground-projects {
  position: relative;
  padding-bottom: 100px;
}
.play-link {
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

.play-link-right {
  margin: 0 200px 0 auto;
  width: 400px;
  max-width: 100%;
}
</style>
