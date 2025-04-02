<template>
  <span
    ref="htmlEl"
    class="text-wrapper"
    :class="{ 'reduced-motion': displayStore.prefersReducedMotion }"
  >
    <slot />
  </span>
</template>

<script setup>
import { Canvas } from '~/utils/canvas';
import { useDisplayStore } from '~/stores/display';

const displayStore = useDisplayStore();
const navigationStore = useNavigationStore();

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
    default: 'dark',
  },
});

const htmlEl = ref('htmlEl');
const meshId = 'text' + crypto.randomUUID();

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
  if (innerHTML.includes('<!--]-->')) {
    const start = innerHTML.indexOf('<!--[-->') + 8; // Start after '<!--[-->'
    const end = innerHTML.indexOf('<!--]-->'); // End just before '<!--]-->'
    innerHTML = innerHTML.slice(start, end);
  }
  return innerHTML;
};

watch(
  () => props.uniforms,
  (uniforms) => {
    if (displayStore.isMobile || displayStore.prefersReducedMotion) return;
    Canvas.meshUniformsUpdate(meshId, uniforms);
  },
  { deep: true },
);

onMounted(() => {
  htmlEl.value.dataset.meshId = meshId;
});

onBeforeUnmount(() => {
  Canvas.removeMesh(meshId);
});

watch(
  () => navigationStore.canvasInitiated,
  (newVal) => {
    if (displayStore.isMobile || !newVal || displayStore.prefersReducedMotion)
      return;
    // delay canvas initialization to wait for font loaded
    setTimeout(() => {
      Canvas.addTextAsMSDF(
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
