<template>
  <div class="playground-section">
    <Container>
      <h2 class="heading-2">
        <span
          v-canvas3-scroll-action="{ activeRange: 0.9, activateOnce: true }"
        >
          <!--          <Canvas3Text :theme="'light'"> EXAMPLES </Canvas3Text>-->
          Playground
        </span>
        <span class="eye-icon" :class="eyeIconShow ? 'show' : ''"> 👀</span>
      </h2>
      <NuxtLink
        class="playground-link"
        href="/playground"
        @mouseenter="
          eyeIconShow = false;
          ethBlockImageAniIn = true;
        "
        @mouseleave="
          eyeIconShow = false;
          ethBlockImageAniIn = false;
        "
      >
        <div class="playground-link-txt">
          Enter playground with more examples and experiments 👉
        </div>
      </NuxtLink>
      <!--      <img-->
      <!--        v-canvas3-image="{-->
      <!--          uniforms: {-->
      <!--            uTransition: {-->
      <!--              value: ethBlockImageAniIn ? 1 : 0,-->
      <!--              duration: ethBlockImageAniIn ? 0.35 : 0.15,-->
      <!--              ease: 'linear',-->
      <!--            },-->
      <!--            uTextureMaskNoise: { value: animationAssets.getTextureMaskNoise() },-->
      <!--            uTexturePrevious: {-->
      <!--              value: animationAssets.getTextureDefaultBlack(),-->
      <!--            },-->
      <!--          },-->
      <!--          shaderName: 'example0',-->
      <!--        }"-->
      <!--        :src="`/images/04.webp`"-->
      <!--        alt=""-->
      <!--        class="play-block-image"-->
      <!--      />-->
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
// import { useAnimationAssets } from "~/stores/animationAssets";

// const animationAssets = useAnimationAssets();

const eyeIconShow = ref(false);
const ethBlockImageAniIn = ref(false);
</script>

<style lang="scss" scoped>
.playground-section {
  position: relative;
  min-height: 500px;
}
.playground-link {
  padding: 30px 30px 30px 0;
  display: block;
  position: relative;
  color: inherit;
  &:hover {
    //text-decoration: none;
  }
}

.eye-icon {
  position: relative;
  transition: ease all 0.3s;
  opacity: 0;
  &.show {
    opacity: 1;
  }
}

.heading-2 {
  padding-top: 50px;
  padding-bottom: 20px;
}
.play-block-image {
  position: absolute;
  bottom: 150px;
  left: 35%;
  z-index: -1;
}
</style>
