<template>
  <span
    ref="htmlEl"
    class="text-wrapper"
    :class="{ 'reduced-motion': Canvas3.displayStore?.prefersReducedMotion }"
  >
    <slot />
  </span>
</template>

<script setup>
import { Canvas3 } from "~/utils/canvas3";

const props = defineProps({
  shader: {
    type: String,
    default: null,
  },
  uniforms: {
    type: Object,
    default: () => {},
  },
  theme: {
    type: String,
    default: "dark",
  },
});

const htmlEl = ref("htmlEl");
const meshId = "text" + crypto.randomUUID();

const meshUniforms = computed(() => {
  const uni = {};
  for (const key in props.uniforms) {
    uni[key] = {
      value: 0,
    };
  }
  return uni;
});

const getTrimmedText = () => {
  let innerHTML = htmlEl.value.innerHTML;
  //remove nuxt slot comment from innerHTML, only once
  if (innerHTML.includes("<!--]-->")) {
    const start = innerHTML.indexOf("<!--[-->") + 8; // Start after '<!--[-->'
    const end = innerHTML.indexOf("<!--]-->"); // End just before '<!--]-->'
    innerHTML = innerHTML.slice(start, end);
  }
  return innerHTML;
};

watch(
  () => props.uniforms,
  (uniforms) => {
    if (
      Canvas3.displayStore?.isMobile ||
      Canvas3.displayStore?.prefersReducedMotion
    )
      return;
    setTimeout(() => {
      Canvas3.meshUniformsUpdate(meshId, uniforms);
    }, 0);
  },
  { deep: true },
);

onMounted(() => {
  htmlEl.value.dataset.meshId = meshId;
});

onBeforeUnmount(() => {
  Canvas3.removeMesh(meshId);
});

watch(
  () => Canvas3.canvasInitiated.value,
  (newVal) => {
    if (
      Canvas3.displayStore?.isMobile ||
      !newVal ||
      Canvas3.displayStore?.prefersReducedMotion
    )
      return;
    // delay canvas initialization to wait for font loaded
    setTimeout(() => {
      Canvas3.addTextAsMSDF(
        props.shader,
        meshId,
        htmlEl.value,
        getTrimmedText(),
        props.theme,
        false,
        meshUniforms.value,
      );
    }, 0);
  },
);
</script>

<style lang="scss" scoped>
.text-wrapper {
  opacity: 0;
  display: inline-block;

  &.reduced-motion {
    opacity: 1;
  }

  @include respond-width($w-s) {
    opacity: 1;
  }
}
</style>
