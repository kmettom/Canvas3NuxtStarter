<template>
  <div class="code-container" :style="`width:${width}`">
    <code>

    <slot />
    </code>

  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.code-container {
  width: calc(100% - 30px);
  max-width: calc(375px - 30px);
  display: inline-block;
  border-radius: 5px;
  margin: 10px 0;
  background: black;
  padding: 15px;
  border: 1px solid dimgray;
}
</style>
