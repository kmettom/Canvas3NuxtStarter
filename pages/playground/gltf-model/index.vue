<template>
  <div class="page-container">
    <div
      ref="gltfElDavid"
      v-canvas3-gltf-model="gltfBindingDavid"
      class="gltf-david-el"
    />

    <div
      ref="gltfElGeo"
      v-canvas3-gltf-model="gltfBindingGeo"
      class="gltf-geo-el"
    />

    <div
      v-for="(frame, index) in keyframeSectionContent"
      :key="index"
      class="frame-section"
    >
      <div
        class="content-block"
        :style="`top:${frame.position.top}%;left:${frame.position.top}%;`"
      >
        <div class="content-wrapper">
          <div v-if="frame.content" class="content">
          {{ frame.content }}
          </div>
          <div v-if="frame.smallContent" class="sm-content">
          {{ frame.smallContent }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

useSeoMeta({
  title: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogTitle: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  description: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogDescription: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
});

const gltfElDavid = ref(null);
const gltfElGeo = ref(null);

const keyframeSectionContent = ref([
  {
    content: "Canvas3",
    smallContent: "some example - this is a Nuxt threeJs module",
    position: { top: 0, left: 50, right: 0 },
  },
  {
    content: "GLTF",
    position: { top: 0, left: 0 },
  },
  {
    content: "Story Line",
    position: { top: 0, left: 0 },
  },
  {
    content: "Light settings",
    smallContent: "Set lights per model per keyframe in your story line",
    position: { top: 0, left: 0 },
  },
  {
    content: "Move light source",
    smallContent: "Move lights per model",
    position: { top: 0, left: 0 },
  },
  {
    content: "Position",
    position: { top: 0, left: 0 },
  },
  {
    content: "Rotate",
    position: { top: 0, left: 0 },
  },
  {
    content: "Scale",
    position: { top: 0, left: 0 },
  },
  {
    content: "Get in Touch",
    smallContent: "",
    position: { top: 0, left: 0 },
  }
]);

const gltfPositioningDavid = ref({
  keyframes: [
    {
      id: "1_start_to_right",
      start: 0,
      end: 0.2,
      from: {
        position: { x: -0.45, y: -0.45, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: { davidKey: { intensity: 1, position: { x: 1, y: 0, z: 0 } } },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        lights: { davidKey: { intensity: 1, position: { x: 0, y: 0, z: 1 } } },
      },
    },
    {
      id: "2_right_rotate",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        lights: { davidKey: { position: { x: 0, y: 0, z: 1 } } },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: { davidKey: { position: { x: -1, y: 0, z: 0 } } },
      },
    },
    {
      id: "3_right_scale_down",
      start: 0.4,
      end: 0.6,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "4_right_scale_down",
      start: 0.6,
      end: 0.8,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: { davidKey: { intensity: 2.5 } },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        lights: { davidKey: { intensity: 0.5 } },
      },
    },
    {
      id: "5_to_left_scale_up",
      start: 0.8,
      end: 1,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        lights: {
          davidKey: { intensity: 0.5, position: { x: -1, y: 0.5, z: 1 } },
        },
      },
      to: {
        position: { x: -0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
        lights: {
          davidKey: { intensity: 2, position: { x: 1, y: 0.5, z: 1 } },
        },
      },
    },
  ],
  mouseParallax: {
    x: 0.0,
    y: 0.0,
    z: 0.0,
  },
});

const gltfBindingDavid = ref({
  url: "/gltf/david_head/scene.gltf",
  name: "david",
  container: gltfElDavid.value,
  positioning: gltfPositioningDavid.value,
  lighting: {
    environment: "room",
    environmentIntensity: 0.2,
    toneMapping: "aces",
    exposure: 1,
    defaultLights: false,
    lights: [
      {
        id: "davidKey",
        type: "directional",
        color: 0xff0009,
        intensity: 0,
        position: { x: 0, y: 0, z: 0 },
      },
    ],
  },
});

const gltfPositioningGeo = ref({
  keyframes: [
    {
      id: "1_start_to_right",
      start: 0,
      end: 0.2,
      from: {
        position: { x: 0.35, y: 0.15, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      to: {
        position: { x: -0.2, y: 0.2, z: 0 },
        rotation: { x: Math.PI, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
    },
    {
      id: "2_right_rotate",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: -0.2, y: 0.2, z: 0 },
        rotation: { x: Math.PI, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
      to: {
        position: { x: -0.2, y: 0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "3_right_scale_down",
      start: 0.4,
      end: 0.6,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "4_right_scale_down",
      start: 0.6,
      end: 0.8,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
      },
    },
    {
      id: "5_to_left_scale_up",
      start: 0.8,
      end: 1,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
      },
      to: {
        position: { x: -0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
    },
  ],
  mouseParallax: {
    x: 0.025,
    y: 0.025,
    z: 0,
  },
});

const gltfBindingGeo = ref({
  url: "/gltf/icosidodecahedron/scene.gltf",
  name: "geometry",
  container: gltfElGeo.value,
  positioning: gltfPositioningGeo.value,
  lighting: {
    environment: "room",
    environmentIntensity: 0.1,
    toneMapping: "aces",
    exposure: 1,
    defaultLights: false,
    lights: [
      {
        type: "directional",
        color: 0x000dff,
        intensity: 1,
        position: { x: -1, y: 0.5, z: 1 },
      },
    ],
  },
});
</script>

<style lang="scss" scoped>
.page-container{
  font-family: "PP Formula Black", serif;
}
.gltf-david-el {
  height: 750px;
  width: 750px;
  position: absolute;
  top: 0;
  left: 0;
}
.gltf-geo-el {
  height: 250px;
  width: 250px;
  position: absolute;
  top: 0;
  left: 0;
}
.frame-section {
  height: 1000px;
  position: relative;
}
.content-block {
  position: absolute;
  height: 100%;
  width: 100%;
  transform: translate(50%,50%);
}
.content-wrapper{
  position: absolute;
}
.content {
  text-transform: uppercase;
  font-size: 155px;
}
.sm-content{
  padding-left: 10px;
  font-size: 25px;
  text-transform: uppercase;
}
</style>
