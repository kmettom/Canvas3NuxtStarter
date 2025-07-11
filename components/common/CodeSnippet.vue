<template>
  <div class="code-container">
    <code>
      <slot />
    </code>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.code-container {
  width: calc(100% - 20px);
  max-width: calc(375px - 20px);
  display: inline-block;
  border-radius: 0px;
  margin: 10px 0;
  color: var(--dark-color);
  background: var(--light-color);
  padding: 10px;
}
</style>
