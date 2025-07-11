<template>
  <div id="appContainer">
    <CommonWelcomeScreen
      :welcome-init="welcomeInit"
      @welcome-complete="welcomeFinished()"
    />

    <CommonNavigation :page-active="null" />

    <div id="scrollContainer">
      <div id="scrollableContent" ref="scrollableContent">
        <slot :page-active="contentActive" />
      </div>
    </div>

    <div
      id="animationContainer"
      ref="canvasEl"
      :class="{ 'back-layer': backLayerCanvas }"
    />
    <CanvasCursor v-if="contentActive" />
    <img
      alt="hidden image for font"
      loading="eager"
      src="/font/PPFormula-CondensedBlack.png"
      style="display: none"
    />
  </div>
</template>

<script setup>
//TODO: fix first load render
//TODO: Page transition scroll to top implement, check page navigation and page transition animations

import { Canvas3 } from "~/utils/canvas3";

// import { useDisplayStore } from "~/stores/display";
// import { useNavigationStore } from "~/stores/navigation";
// import { useCanvas3Store } from "~/stores/canvas3";

const welcomeInit = ref(false);

// const navigationStore = useNavigationStore();
// const displayStore = useDisplayStore();

const backLayerCanvas = computed(() => {
  return (
    Canvas3.navigationStore?.activeNavItem === "home" ||
    !Canvas3.navigationStore?.navVisible
  );
});

const canvasEl = ref("canvasEl");

const scrollableContent = ref("scrollableContent");

watch(
  () => Canvas3.navigationStore?.canvasInitiated,
  (newVal) => {
    if (newVal) {
      welcomeInit.value = true;
    }
  },
);

const contentActive = ref(false);
const welcomeFinished = () => {
  contentActive.value = true;
};

onMounted(async () => {
  // await Canvas.init(canvasEl.value, scrollableContent.value);
  // displayStore.init();
  // navigationStore.canvasInitiated = true;
  await Canvas3.init(canvasEl.value, scrollableContent.value);
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
