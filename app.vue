<template>
  <DefaultPageLayout
    :transition="{
      name: 'pagetransition',
      onBeforeEnter: (el) => {
        //TODO: add this feature inside the component, then to Canvas Init Options
        // Canvas.scrollToTop(0);
      },
    }"
  >
    <NuxtPage />
  </DefaultPageLayout>
</template>
<script setup>
//TODO: add this feature inside the component, then to Canvas Init Options (page transition above)
import DefaultPageLayout from "~/layout/DefaultPageLayout.vue";

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
