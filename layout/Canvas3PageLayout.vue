<template>
  <div id="appContainer">
    <CommonWelcomeScreen
      :welcome-init="welcomeInit"
      @welcome-complete="welcomeFinished()"
    />

    <CommonNavigation />

    <div id="scrollContainer">
      <div id="scrollableContent" ref="scrollableContent">
        <NuxtPage :page-active="contentActive" />
      </div>
    </div>

    <div
      id="animationContainer"
      ref="canvasEl"
      :class="{ 'back-layer': backLayerCanvas }"
    />
    <Canvas3Cursor v-if="contentActive" />
    <img
      alt="hidden image for font"
      loading="eager"
      src="/font/PPFormula-CondensedBlack.png"
      style="display: none"
    />
  </div>
</template>

<script setup>
//TODO: Page transition scroll to top implement, check page navigation and page transition animations

import { Canvas3 } from "~/utils/canvas3";

const props = defineProps({
  canvasOptions: {
    type: Object,
    default: () => {},
  },
});

const welcomeInit = ref(false);

const backLayerCanvas = computed(() => {
  return (
    Canvas3.navigationStore?.activeNavItem === "home" ||
    !Canvas3.navigationStore?.navVisible
  );
});

const canvasEl = ref("canvasEl");

const scrollableContent = ref("scrollableContent");

const contentActive = ref(false);

const welcomeFinished = () => {
  contentActive.value = true;
};

onMounted(async () => {
  await Canvas3.initialize(
    canvasEl.value,
    scrollableContent.value,
    props.canvasOptions,
  );
  welcomeInit.value = true;
});
</script>

<style lang="scss">
#scrollContainer {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

#scrollableContent {
  will-change: transform;
}

#animationContainer {
  width: 100%;
  height: 100vh;
  max-height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  pointer-events: none;
  z-index: 0; //-1
  &.back-layer {
    z-index: -1; //-1
  }
}
</style>
