<script setup lang="ts">
import { ref, watch, defineEmits } from "vue";
import { gsap } from "gsap";

// Define props
const props = defineProps({
  welcomeInit: {
    type: Boolean,
    required: true,
  },
});

// Define emits
const emit = defineEmits(["welcomeComplete"]);

// Reactive state
const welcomeAniDuration = ref(0); // 0.5
// const welcomeAniDelay = ref(0.25); // 0.25
const welcomeHideDuration = ref(0); // 0.5
const welcomeHideDelay = ref(0); // 0.5

// Function for animation
function welcomeAnimation() {
  gsap.to(".welcome", {
    duration: welcomeHideDuration.value,
    delay: welcomeAniDuration.value + welcomeHideDelay.value,
    opacity: 0,
    height: 0,
    ease: "power4.in",
    onComplete: () => {
      welcomeComplete();
    },
  });
}

// Emit function
function welcomeComplete() {
  emit("welcomeComplete");
}

// Watch for changes in 'welcomeInit' prop
watch(
  () => props.welcomeInit,
  (newValue) => {
    if (newValue) {
      welcomeAnimation();
    }
  },
);
</script>

<template>
  <div class="welcome" />
</template>

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
