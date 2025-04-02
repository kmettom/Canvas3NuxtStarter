<template>
  <div class="welcome" />
</template>
<script>
import { gsap } from 'gsap';

export default {
  props: {
    welcomeInit: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['welcomeComplete'],

  data() {
    return {
      show: false,
      welcomeAniDuration: 0.0, //0.5
      welcomeAniDelay: 0.25, //0.25
      welcomeHideDuration: 0, //0.5
      welcomeHideDelay: 0.5, //0.5
    };
  },
  watch: {
    welcomeInit(newValue) {
      if (newValue) {
        this.welcomeAnimation();
      }
    },
  },
  mounted() {},
  methods: {
    welcomeAnimation() {
      gsap.to('.welcome', {
        duration: this.welcomeHideDuration,
        delay: this.welcomeAniDuration + this.welcomeHideDelay,
        opacity: 0,
        height: 0,
        ease: 'power4.in',
        onComplete: () => {
          this.welcomeComplete();
        },
      });
    },
    welcomeComplete() {
      this.$emit('welcomeComplete');
    },
  },
};
</script>
<style lang="scss" scoped>
.welcome {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 99;
  background-color: var(--dark-color);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}
</style>
