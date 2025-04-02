<template>
  <div class="service" :style="`width:${blockSize}px;`">
    <div class="header">
      <div class="iconFrame">
        {{ icon }}
      </div>
      <h4 class="heading-4">{{ title }}</h4>
    </div>
    <p class="body-m">{{ text }}</p>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: null,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    blockSize: {
      type: Number,
      default: 340,
      required: true,
    },
  },
  setup() {},
};
</script>

<style lang="scss" scoped>
.service {
  aspect-ratio: 1/1;
  color: var(--light-color);
  background-color: var(--dark-color);
  padding: 50px 40px;
  text-align: left;
}

.header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.iconFrame {
  display: inline-block;
  position: relative;
  bottom: 3px;
}
</style>
