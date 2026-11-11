<template>
  <WelcomeScreen
    :welcome-init="welcomeInit"
    @welcome-complete="welcomeFinished()"
  />
  <CommonNavigation />
  <NuxtLayout
    :name="layout"
    :canvas3options="Canvas3OptionsComputed"
    :canvas3enabled="contentActive"
    @canvas3-ready="onCanvas3Ready"
  >
    <NuxtPage
      :page-active="contentActive"
      :transition="{
        name: 'curtain',
        mode: 'out-in',
        async onLeave(_el, done) {
          try {
            await waitOutDone(); // ⬅️ blocks until OUT finishes
          } finally {
            done();
          }
        },
      }"
    />
  </NuxtLayout>
  <!--  TODO: Cursor implement -->
  <!--  <Cursor />-->

  <!--  **********************************-->
  <!--  MSDF TEXT FONT LOAD-->
  <!--  **********************************-->

  <!--  <img-->
  <!--    alt="hidden image for font"-->
  <!--    loading="eager"-->
  <!--    src="/fonts/PPFormula-CondensedBlack.png"-->
  <!--    style="display: none"-->
  <!--  />-->
</template>
<script setup lang="ts">
import { Canvas3Options } from "~/constants/canvas3-options";
import WelcomeScreen from "~/components/common/WelcomeScreen.vue";
import { waitOutDone } from "~/composables/useOutPromise";
import { pageTransition } from "~/utils/animations/pageTransition";
import { useAnimationAssets } from "~/stores/animationAssets";
// import Cursor from "~/components/common/Cursor.vue";

useSeoMeta({
  title: "Web developer - Tomas Kmet - creative - web3",
  description: "Web developer - Tomas Kmet - creative - web3",
  ogTitle: "Web developer - Tomas Kmet - creative - web3",
  ogDescription: "Web developer - Tomas Kmet - creative - web3",
});
useHead({
  htmlAttrs: {
    lang: "en",
  },
  style: [
    {
      children: `
html {
  // background-color: #1b1818;
  background-color: #191919;
}
      `,
    },
  ],
});

const navigationStore = useNavigationStore();

const Canvas3OptionsComputed = computed(() => {
  return {
    ...Canvas3Options,
    canvasElement: { zIndex: navigationStore.canvas3zIndex },
  };
});

const layout = "canvas3";

const welcomeInit = ref(false);

const displayStore = useDisplayStore();
const animationAssets = useAnimationAssets();

const onCanvas3Ready = () => {
  pageTransition.init();
  setTimeout(() => {
    //TODO: temporary delay as there is no welcome animation
    navigationStore.setWebFirstLoadDone(true);
  }, 1000);
};

onMounted(async () => {
  welcomeInit.value = true;
  displayStore.init();
  await animationAssets.init();
});

const contentActive = ref(false);
const welcomeFinished = () => {
  contentActive.value = true;
};
</script>
