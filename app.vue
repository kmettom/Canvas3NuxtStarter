<template>
  <WelcomeScreen
    :welcome-init="welcomeInit"
    @welcome-complete="welcomeFinished()"
  />
  <NuxtLayout
    :name="layout"
    :canvas3options="Canvas3Options"
    :canvas3enabled="contentActive"
  >
    <NuxtPage :page-active="contentActive" />
  </NuxtLayout>
  <img
    alt="hidden image for font"
    loading="eager"
    src="/font/PPFormula-CondensedBlack.png"
    style="display: none"
  />
</template>
<script setup>
import { Canvas3Options } from "~/constants/canvas3-options";
import WelcomeScreen from "~/components/common/WelcomeScreen.vue";
useHead({
  htmlAttrs: {
    lang: "en",
  },
  style: [
    {
      children: `
      html {
              background-color: #1b1818;
            }
      `,
    },
  ],
});

const layout = "canvas3";

const welcomeInit = ref(false);

// watch(
//     () => Canvas3.options.canvasInitiated,
//     (newVal) => {
//       if (newVal) {
//         welcomeInit.value = true;
//       }
//     },
// );

onMounted(() => {
  welcomeInit.value = true;
});

const contentActive = ref(false);
const welcomeFinished = () => {
  contentActive.value = true;
};
</script>
