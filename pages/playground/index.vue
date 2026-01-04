<template>
  <div>
    <div>
      <SectionContact />
    </div>
    <div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionContact from "~/pages/index/SectionContact.vue";
import Footer from "~/components/common/Footer.vue";

useSeoMeta({
  title: "Canvas3 NUXT Starter",
  ogTitle: "Canvas3 NUXT Starter",
  description: "Canvas3 NUXT Starter",
  ogDescription: "Canvas3 NUXT Starter",
});
</script>

<style lang="scss"></style>
