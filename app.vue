<template>
  <CommonWelcomeScreen
    :welcome-init="welcomeInit"
    @welcome-complete="welcomeFinished()"
  />
  <DefaultPageLayout
    :transition="{
      name: 'pagetransition',
      onBeforeEnter: (el) => {
        Canvas.scrollToTop(0);
      },
    }"
  >
    <NuxtPage :page-active="contentActive" />
  </DefaultPageLayout>
  <CanvasCursor v-if="contentActive" />
  <img
    alt="hidden image for font"
    loading="eager"
    src="/font/PPFormula-CondensedBlack.png"
    style="display: none"
  />
</template>
<script setup>
import DefaultPageLayout from '~/layout/DefaultPageLayout.vue';
const navigationStore = useNavigationStore();

const welcomeInit = ref(false);

useHead({
  htmlAttrs: {
    lang: 'en',
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

watch(
  () => navigationStore.canvasInitiated,
  (newVal) => {
    if (newVal) {
      welcomeInit.value = true;
    }
  },
);

// onMounted(() => {
//   welcomeInit.value = true;
// });

const contentActive = ref(false);
const welcomeFinished = () => {
  contentActive.value = true;
};
</script>
