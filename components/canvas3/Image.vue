<template>
  <div class="webgl-img-wrapper">
    <img
      ref="image"
      class="webgl-img"
      :class="{ 'reduced-motion': Canvas3.displayStore?.prefersReducedMotion }"
      :alt="imageSettings.alt"
      :src="imageSettings.srcLink"
      :loading="imageSettings.loadStrategy"
      @load="addImageToCanvas"
    />
  </div>
</template>

<script setup>
import { Canvas3 } from "~/utils/canvas3";

const props = defineProps({
  imageSettings: {
    type: {
      alt: { type: String, required: true },
      srcLink: { type: String, required: true },
      loadStrategy: { type: String, default: "lazy" },
    },
    default: () => ({
      loadStrategy: "lazy",
    }),
  },
  canvas3Options: {
    type: {
      shaderName: {
        type: String,
      },
      uniforms: {
        type: Object,
        default: () => {},
      },
      activateMeshUniforms: {
        type: Object,
        default: () => {},
      },
    },
    default: () => ({
      shaderName: "default",
    }),
  },
});

const generatedMeshId = props.imageSettings.srcLink + crypto.randomUUID();

const image = ref("image");
const imgAddedToCanvas = ref(false);

const addImageToCanvas = () => {
  if (
    imgAddedToCanvas.value ||
    Canvas3.displayStore?.isMobile ||
    Canvas3.displayStore?.prefersReducedMotion
  )
    return;

  Canvas3.addImageAsMesh(
    image.value,
    props.canvas3Options.shaderName,
    generatedMeshId,
    props.canvas3Options.uniforms,
    props.canvas3Options.activateMeshUniforms,
  );
  imgAddedToCanvas.value = true;
};

onMounted(() => {
  image.value.dataset.meshId = generatedMeshId;
});

watch(
  () => Canvas3.canvasInitiated.value,
  (newVal) => {
    if (newVal && image.value.naturalWidth !== 0) {
      addImageToCanvas();
    }
  },
);

watch(
  () => props.canvas3Options.uniforms,
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
