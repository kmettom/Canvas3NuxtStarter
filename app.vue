<template>
  <Canvas3PageLayout
    :canvas-options="CanvasOptions"
    :transition="{
      name: 'pagetransition',
      onBeforeEnter: (el) => {
        //TODO: add this feature inside the component, then to Canvas Init Options
        // Canvas3.scrollToTop(0);
      },
    }"
  >
    <NuxtPage />
  </Canvas3PageLayout>
</template>
<script setup>
//TODO: add this feature inside the component, then to Canvas Init Options (page transition above)
import Canvas3PageLayout from "~/layout/Canvas3PageLayout.vue";
import { CanvasOptions } from "~/utils/canvas3Options";

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
</script>
