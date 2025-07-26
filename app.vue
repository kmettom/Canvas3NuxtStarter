<template>
  <WelcomeScreen
    :welcome-init="welcomeInit"
    @welcome-complete="welcomeFinished()"
  />
  <CommonNavigation />
  <NuxtLayout
    :name="layout"
    :canvas3options="Canvas3Options"
    :canvas3enabled="contentActive"
  >
    <NuxtPage :page-active="contentActive" />
  </NuxtLayout>
  <!--  <Cursor />-->
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
// import Cursor from "~/components/common/Cursor.vue";
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

const displayStore = useDisplayStore();

onMounted(() => {
  welcomeInit.value = true;
  displayStore.init();
});

const contentActive = ref(false);
const welcomeFinished = () => {
  contentActive.value = true;
};
</script>
