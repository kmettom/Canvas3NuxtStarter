<template>
  <NuxtLayout :name="layout" :canvas3options="Canvas3Options">
    <NuxtPage />
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

const layout = "canvas3";

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
