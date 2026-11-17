<template>
  <div class="page-container">
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <Canvas3Text
      class="msdf-text"
      text="Canvas3 MSDF"
      :duration="1.5"
      split-style="word"
      ease="linear"
      theme="light"
    />
    <br />
    <br />
    <br />
    <br />
    <br />
        <Canvas3Text
          class="msdf-text"
          text="EXAMPLE"
          :duration="1"
          split-style="word"
          ease="linear"
          theme="light"
          shader="textCRT"
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
.page-container {
  text-align: center;
}
.msdf-text {
  font-family: "PP Formula Black", serif;
  font-size: 200px;
}
</style>
