<template>
  <div class="hero-section-wrapper">
    <Container additional-class="hero-section">
      <div class="hero-content-line hero-line-tomas">
        <h2 v-set-data-attrs="{ cursorcolor: 'light' }" class="heading-1">
          <CanvasText :theme="'light'" :uniforms="mainTextInUniforms">
            TOMAS
          </CanvasText>
        </h2>
        <div class="body-m hero-content-sm hero-summary">
          <p>Web Developer with</p>
          <p>managerial background,</p>
          <p>coding and bringing a full</p>
          <p>team to help your project.</p>
        </div>
      </div>

      <div class="hero-content-line hero-line-kmet">
        <div class="body-m hero-content-sm hero-services">
          <p>web3</p>
          <p>creative</p>
          <p>web apps</p>
          <p>websites</p>
          <p>e-commerce</p>
        </div>
        <h2 v-set-data-attrs="{ cursorcolor: 'light' }" class="heading-1">
          <CanvasText :theme="'light'" :uniforms="mainTextInUniforms">
            KMET
          </CanvasText>
        </h2>
      </div>
    </Container>
    <div class="hero-bg-image">
      <CanvasImage
        :src-link="'images/hero.webp'"
        :uniforms="imageUniforms"
        :shader="'hero'"
        :load-strategy="'preload'"
        :alt="'background portrait image of a person'"
      />
    </div>
  </div>
</template>

<script setup>
import Container from '~/components/common/Container.vue';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
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

  const tl = gsap.timeline();
  const split = new SplitText('.hero-content-sm', { type: 'words,lines' });
  tl.set(split.lines, {
    opacity: 0,
    y: 10,
  });
  tl.set('.hero-content-sm', { opacity: 1 });
  tl.to(split.lines, {
    y: 0,
    opacity: 1,
    delay: 1.5,
    duration: 0.2,
    stagger: 0.05,
  });
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
  &.hero-line-tomas {
    right: 15%;
    top: 20px;
    @include respond-width($w-m-s) {
      top: 0px;
    }
    @include respond-width($w-xs) {
      right: auto;
    }
  }
  &.hero-line-kmet {
    left: 20%;
    bottom: 20px;
    @include respond-width($w-m-s) {
      bottom: 20px;
    }
    @include respond-width($w-s) {
      bottom: 0;
    }
  }
}

.hero-content-sm {
  position: absolute;
  padding: 0 20px;
  width: 300px;
  opacity: 0;
  &.hero-services {
    text-align: right;
    left: -300px;
    bottom: 25%;
  }
  &.hero-summary {
    text-align: left;
    right: -300px;
    bottom: 25%;
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
  width: 50%;
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
