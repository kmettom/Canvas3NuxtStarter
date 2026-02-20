<template>
  <div class="playground-section">
    <Container>
      <h2 class="heading-2">
        <span v-action-on-scroll="{ activeRange: 0.9, activateOnce: true }">
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
        <div>Enter playground with more examples and experiments 👉</div>
      </NuxtLink>
      <img
        v-canvas3-image="{
          loadStrategy: 'preload',
          uniforms: {
            uAniInImage: {
              value: ethBlockImageAniIn ? 1 : 0,
              duration: 0.35,
              ease: 'linear',
            },
            uBlockColor: {
              value: 0.5,
              duration: 0.5,
              ease: 'linear',
            },
            uBlocks: {
              value: 5,
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
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";

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
    text-decoration: none;
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
