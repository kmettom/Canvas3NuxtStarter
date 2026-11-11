<template>
  <div class="page-container">
    <h1 class="heading-2 play-headline">Playground</h1>
    <div class="playground-projects">
      <nuxt-link
        v-for="link in playgroundLinks"
        :key="link.href"
        class="play-link"
        :href="link.href"
        target="_blank"
      >
        <div
          :class="link.alignRight ? 'play-link-right' : 'play-link'"
          @mouseenter="link.hovered = true"
          @mouseleave="link.hovered = false"
        >
          <h3 class="body-l">{{ link.title }}</h3>
          <p class="body-s">{{ link.description }}</p>
          <img
            v-canvas3-image="{
              uniforms: {
                uAniInImage: {
                  value: imagesAniIn ? (link.hovered ? 0.85 : 1) : 0,
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
            :src="link.image"
            alt=""
            class="play-block-image"
          />
        </div>
      </nuxt-link>
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

type PlaygroundLink = {
  href: string;
  title: string;
  description: string;
  image: string;
  alignRight: boolean;
  hovered: boolean;
};

const navigationStore = useNavigationStore();

const imagesAniIn = ref(false);

const playgroundLinks = reactive<PlaygroundLink[]>([
  {
    href: "/playground/eth-blocks",
    title: "Ethereum blocks",
    description:
      "Ethereum network listener with interaction for new blocks added to the blockchain",
    image: "/images/01.jpg",
    alignRight: false,
    hovered: false,
  },
  {
    href: "/playground/scroll-performance",
    title: "Scroll performance",
    description:
      "Example of scroll performance with different scroll speed sections and shaders",
    image: "/playground/images/02.webp",
    alignRight: true,
    hovered: false,
  },
  {
    href: "/playground/gltf-model",
    title: "GLFT model",
    description: "3D model import and story line example",
    image: "/playground/images/03.webp",
    alignRight: false,
    hovered: false,
  },
  // {
  //   href: "/playground/msdf-font",
  //   title: "MSDF font",
  //   description: "MSDF font render and animations example",
  //   image: "/playground/images/04.webp",
  //   alignRight: true,
  //   hovered: false,
  // },
  // {
  //   href: "/playground/gallery-layout",
  //   title: "Gallery layout",
  //   description: "gallery layout case study",
  //   image: "/playground/images/05.webp",
  //   alignRight: false,
  //   hovered: false,
  // },
]);

onMounted(() => {
  const timeDelay = navigationStore.webFirstLoadDone
    ? pageTransition.setup.duration * 2500
    : 100;

  setTimeout(() => {
    imagesAniIn.value = true;
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
