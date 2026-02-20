<template>
  <div class="hero-section-wrapper">
    <Container additional-class="hero-section">
      <div class="hero-content-line hero-line-canvas">
        <h2 class="heading-1">Canvas3</h2>
      </div>
    </Container>
    <div class="hero-bg-image">
      <img
        v-canvas3-image="{
          loadStrategy: 'eager',
          uniforms: imageUniforms,
          shaderName: 'hero',
        }"
        :src="'/images/08.JPG'"
        alt="background wave on beach"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { pageTransition } from "~/utils/animations/pageTransition";

gsap.registerPlugin(SplitText);

const imageIn = ref(false);

const imageUniforms = computed(() => {
  return {
    uAniInImage: { value: imageIn.value ? 1 : 0, duration: 1.25, ease: "ease" },
  };
});

const navigationStore = useNavigationStore();

const heroSectionAnimation = () => {
  const timeDelay = navigationStore.webFirstLoadDone
    ? pageTransition.setup.duration * 2500
    : 100;

  setTimeout(() => {
    imageIn.value = true;
  }, timeDelay);
};

onMounted(() => {
  heroSectionAnimation();
});
</script>

<style lang="scss" scoped>
.hero-section-wrapper {
  position: relative;
  @include respond-width($w-m-s) {
    height: 100vh;
  }
}
.hero-section {
  padding: 16vh;
  position: relative;
  text-align: center;
  @include respond-width($w-m-s) {
    padding-top: 35vh;
  }
  @include respond-width($w-xs) {
    padding: 35vh 0 0 0;
  }
}

.hero-content-line {
  position: relative;
  text-align: center;
  margin: 0 auto;
  justify-content: center;
}
.hero-line-canvas {
  color: var(--dark-color);
}

.hero-content-sm {
  padding: 0 20px;
  opacity: 0;
  &.hero-services {
    text-align: right;
  }
  &.hero-summary {
    text-align: left;
    @include respond-width($w-m-s) {
      display: none;
    }
  }
  p {
    position: relative;
  }
}
.hero-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: -1;
  @include respond-width($w-s) {
    max-height: 660px;
    filter: blur(15px);
  }
  * {
    width: 100%;
    height: 100%;
  }
}
</style>
