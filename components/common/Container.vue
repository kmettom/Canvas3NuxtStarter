<template>
  <div :class="['section-container', additionalClass]">
    <slot />
  </div>
</template>

<script lang="ts">
export default {
  props: {
    additionalClass: {
      type: String,
      default: "",
    },
  },
};
</script>

<style lang="scss" scoped>
.section-container {
  max-width: 1248px;
  margin: 0 auto;
}
</style>
