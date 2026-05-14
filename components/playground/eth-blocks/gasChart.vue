<script setup lang="ts">
const props = defineProps({
  gasValue: {
    type: Number,
    required: true,
  },
});

const dashoffset = computed(() => {
  return -125 * (props.gasValue / 100) + 125;
});
</script>

<template>
  <svg
    class="gas-chart-svg"
    width="46"
    height="46"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      id="gas-chart-bg"
      cx="23"
      cy="23"
      r="19.327"
      stroke="white"
      stroke-opacity="0.2"
      stroke-width="6"
      fill="none"
    />
    <circle
      id="gas-chart-value"
      cx="23"
      cy="23"
      r="19.327"
      stroke="white"
      stroke-width="6"
      fill="none"
      stroke-linecap="butt"
      stroke-dasharray="125"
      :stroke-dashoffset="dashoffset"
      transform="rotate(-90 23 23)"
    />
  </svg>
</template>

<style scoped lang="scss"></style>
