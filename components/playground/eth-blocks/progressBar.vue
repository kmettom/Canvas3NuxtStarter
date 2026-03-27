<script setup lang="ts">
const props = defineProps({
  progressPercent: {
    type: Number,
    required: true,
    default: 10,
  },
});
</script>

<template>
  <div class="progress-bar">
    <div class="progress-state" :style="`width: ${props.progressPercent}%`" />
  </div>
</template>

<style scoped lang="scss">
.progress-bar {
  margin-top: 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  width: 140px;
  //width: 100%;
  position: relative;
  height: 6px;
  overflow: hidden;
}
.progress-state {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
}
</style>
