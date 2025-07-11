<template>
  <div class="webgl-img-wrapper">
    <img
      ref="image"
      class="webgl-img"
      :class="{ 'reduced-motion': Canvas3.displayStore?.prefersReducedMotion }"
      :alt="alt"
      :src="srcLink"
      :loading="loadStrategy === 'lazy' ? 'lazy' : 'eager'"
      @load="addImageToCanvas"
    />
  </div>
</template>

<script setup>
import { Canvas3 } from "~/utils/canvas3";

const props = defineProps({
  alt: {
    type: String,
    default: "picture",
  },
  srcLink: {
    type: String,
    required: true,
  },
  shader: {
    type: String,
    default: "default",
  },
  uniforms: {
    type: Object,
    default: () => {},
  },
  loadStrategy: {
    type: String,
    default: "lazy",
  },
});

const generatedMeshId = props.srcLink + crypto.randomUUID();

const image = ref("image");
const imgAddedToCanvas = ref(false);

const meshUniforms = computed(() => {
  const uni = {};
  for (const key in props.uniforms) {
    uni[key] = {
      value: 0,
    };
  }
  return uni;
});

const addImageToCanvas = () => {
  if (
    imgAddedToCanvas.value ||
    Canvas3.displayStore?.isMobile ||
    Canvas3.displayStore?.prefersReducedMotion
  )
    return;
  Canvas3.addImageAsMesh(
    image.value,
    props.shader,
    generatedMeshId,
    false,
    meshUniforms.value,
  );
  imgAddedToCanvas.value = true;
};

onMounted(() => {
  image.value.dataset.meshId = generatedMeshId;
});

watch(
  () => Canvas3.navigationStore?.canvasInitiated,
  (newVal) => {
    if (newVal && image.value.naturalWidth !== 0) {
      addImageToCanvas();
    }
  },
);

watch(
  () => props.uniforms,
  (uniforms) => {
    Canvas3.meshUniformsUpdate(generatedMeshId, uniforms);
  },
  { deep: true },
);

onBeforeUnmount(() => {
  Canvas3.removeMesh(generatedMeshId);
});
</script>

<style lang="scss" scoped>
.webgl-img-wrapper {
  @include respond-width($w-s) {
    overflow: hidden;
  }
}

.webgl-img {
  max-width: 100%;
  max-height: 100%;
  opacity: 0;

  &.reduced-motion {
    opacity: 1;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  @include respond-width($w-s) {
    opacity: 1;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}
</style>
