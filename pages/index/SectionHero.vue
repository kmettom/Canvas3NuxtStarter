<template>
  <div class="hero-section-wrapper">
    <Container additional-class="hero-section">
      <div class="hero-content-line hero-line-tomas">
        <h2 v-set-data-attrs="{ cursorcolor: 'light' }" class="heading-1">
          <CanvasText :theme="'light'" :uniforms="mainTextInUniforms">
            NUXT
          </CanvasText>
        </h2>
      </div>

      <div class="hero-content-line hero-line-kmet">
        <h2 v-set-data-attrs="{ cursorcolor: 'light' }" class="heading-1">
          <CanvasText :theme="'light'" :uniforms="mainTextInUniforms">
            THREEJS
          </CanvasText>
        </h2>
      </div>
    </Container>
    <div class="hero-bg-image">
      <CanvasImage
        :src-link="'images/11.JPG'"
        :uniforms="imageUniforms"
        :shader="'hero'"
        :load-strategy="'preload'"
        :alt="'background wave on beach'"
      />
    </div>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const props = defineProps({
  sectionActivate: Boolean,
});

const mainTextIn = ref(false);
const imageIn = ref(false);
const mainTextInUniforms = computed(() => {
  return {
    uAniInText: { active: mainTextIn.value, duration: 2 },
  };
});

const imageUniforms = computed(() => {
  return {
    uAniInImage: { active: imageIn.value, duration: 1.25 },
  };
});

const heroSectionAnimation = () => {
  imageIn.value = true;

  setTimeout(() => {
    mainTextIn.value = true;
  }, 300);
};

watch(
  () => props.sectionActivate,
  (newValue) => {
    if (newValue) {
      heroSectionAnimation();
    }
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
  display: inline-block;
  margin: 0 auto;
  justify-content: center;
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
