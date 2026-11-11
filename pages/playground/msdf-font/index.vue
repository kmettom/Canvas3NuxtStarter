<template>
  <div class="page-container">
    <br />
    <br />
    <br />
    <br />
    <Canvas3Text
      class="msdf-text"
      text="longer text"
      :duration="1"
      split-style="word"
      ease="linear"
    />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    text
    <br />
    <br />
    <br />
    <br />
    <br />
    <Canvas3Text
      class="msdf-text"
      text="longer text"
      :duration="1"
      split-style="word"
      ease="linear"
    />
  </div>
</template>
<script setup lang="ts">
useSeoMeta({
  title: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogTitle: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  description: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogDescription: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
});
</script>
<style lang="scss" scoped>
.msdf-text {
  font-family: "PP Formula Black", serif;
  font-size: 200px;
}
</style>
