<template>
  <div class="page-container">
    <button class="restart-button" type="button" @click="restart">
      Restart
    </button>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <!-- v-canvas3-text directly - animated in on mounted, the restart button plays it again -->
    <div
      v-canvas3-text="{
        theme: 'light',
        shaderName: 'textCRTG',
        uniforms: { uTextAniIn: textAniInCRTG },
      }"
      class="msdf-text"
      style="opacity: 0"
    >
      Canvas3
    </div>
    <br />
    <br />
    <br />
    <br />
    <br />
    <div
      v-canvas3-text="{
        theme: 'light',
        uniforms: { uTextAniIn: textAniInDefault },
      }"
      class="msdf-text"
      style="opacity: 0"
    >
      Canvas3
    </div>
    &nbsp;
    <div
      v-canvas3-text="{
        theme: 'light',
        uniforms: { uTextAniIn: textAniInDefault },
      }"
      class="msdf-text"
      style="opacity: 0"
    >
      MSDF
    </div>
    <br />
    <br />
    <br />
    <br />
    <br />
    <div
      v-canvas3-text="{
        theme: 'light',
        shaderName: 'textCRT',
        uniforms: { uTextAniIn: textAniInCRT },
      }"
      class="msdf-text"
      style="opacity: 0"
    >
      EXAMPLE
    </div>

    <!-- previous version - Canvas3Text components, activated by the scroll action when in view -->
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

type UniformAnimation = { value: number; duration: number; ease?: string };

// the directive passes these to Canvas3.meshUniformsUpdate on every change (gsap tween to value over duration)
const hidden = (): UniformAnimation => ({ value: 0, duration: 0 });
const textAniInDefault = ref<UniformAnimation>(hidden());
const textAniInCRT = ref<UniformAnimation>(hidden());
const textAniInCRTG = ref<UniformAnimation>(hidden());

const animateIn = () => {
  textAniInCRTG.value = { value: 1, duration: 1.5, ease: "linear" };
  textAniInDefault.value = { value: 1, duration: 1.5, ease: "linear" };
  textAniInCRT.value = { value: 1, duration: 1, ease: "linear" };
};

// jump back to 0 instantly, wait a frame so the reset is rendered, then animate in again
const restart = async () => {
  textAniInCRTG.value = hidden();
  textAniInDefault.value = hidden();
  textAniInCRT.value = hidden();
  await nextTick();
  requestAnimationFrame(() => animateIn());
};

onMounted(() => {
  animateIn();
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
.restart-button {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 20;
  padding: 8px 16px;
  font: inherit;
  color: inherit;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 999px;
  cursor: pointer;
}
</style>
