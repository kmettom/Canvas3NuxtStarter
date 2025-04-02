<template>
  <div class="page-container">
    <h1 class="headline">
      <CanvasText :theme="'light'"> Playground </CanvasText>
    </h1>
    <div class="play-1-img-wrapper">
      <CanvasImage :src-link="'images/play/play1.jpg'" :shader="'play1'" />
    </div>
  </div>
</template>
<script setup>
import { onMounted, watch } from 'vue';

useSeoMeta({
  title: 'Tomas Kmet - Web developer - Playground',
  ogTitle: 'Tomas Kmet - Web developer - Playground',
  description: 'Tomas Kmet - Web developer - Playground',
  ogDescription: 'Tomas Kmet - Web developer - Playground',
});

const props = defineProps({
  pageActive: Boolean,
});

const pageAnimateIn = () => {
  // console.log('Example method - animate page transition');
};

onMounted(() => {
  if (props.pageActive) {
    pageAnimateIn();
  }
});

watch(
  () => props.pageActive,
  (newValue) => {
    if (newValue) {
      pageAnimateIn();
    }
  },
);
</script>
<style lang="scss" scoped>
.play-1-img-wrapper {
  margin-left: 200px;
  width: 700px;
}
</style>
