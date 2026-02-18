<template>
  <div class="hero-section-wrapper">
    <Container additional-class="hero-section">
      <div class="hero-content-line hero-line-canvas">
        <h2 class="heading-1">Canvas3</h2>
      </div>
    </Container>
    <div class="hero-bg-image">
      <img
        :src="heroImage"
        alt="background wave on beach"
        v-canvas3-image="{
          loadStrategy: 'eager',
          uniforms: imageUniforms,
          shaderName: 'hero',
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";


gsap.registerPlugin(SplitText);

const heroImage = "/images/08.jpg";

const props = defineProps({
  sectionActivate: Boolean,
});

const mainTextIn = ref(false);
const imageIn = ref(false);

// const mainTextInUniforms = computed(() => {
//   return {
//     uAniInText: { value: mainTextIn.value ? 1 : 0, duration: 2 },
//   };
// });

const imageUniforms = computed(() => {
  return {
    uAniInImage: { value: imageIn.value ? 1 : 0, duration: 1.25, ease: "ease" },
  };
});

const heroSectionAnimation = () => {
  setTimeout(() => {
    mainTextIn.value = true;
    imageIn.value = true;
  }, 100);
};

const sectionActivated = computed(() => {
  return props.sectionActivate;
});

watch(
  () => sectionActivated,
  (newValue) => {
    if (newValue) {
      heroSectionAnimation();
    }
  },
  {
    deep: true,
  },
);
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
