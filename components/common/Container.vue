<template>
  <div :class="['section-container', additionalClass]">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    additionalClass: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.section-container {
  max-width: 1048px;
  margin: 0 auto;
}
</style>
