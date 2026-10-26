<template>
  <div class="page-container">
    <div ref="gltfElDavid" v-canvas3-gltf-model="gltfBindingDavid" class="gltf-el" />

    <div ref="gltfElGeo" v-canvas3-gltf-model="gltfBindingGeo" class="gltf2-el" />

    <div
      v-for="(frame, index) in keyframeSectionContent"
      :key="index"
      class="frame-section"
    >
      <!--      {{ frame.id }}-->
      <div
        class="content-block"
        :style="`top:${frame.position.top}%;left:${frame.position.top}%;`"
      >
        <div class="content">
          {{ frame.content }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
//TODO:
// - scope 3d object scroll to a container size, if container exists
// - Check shaders on 3d object, of how to reveal a object
// -

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
    position: { top: 25, left: 20, right: 0 },
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
    content: "End",
    position: { top: 0, left: 0 },
  },
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
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
    },
    {
      id: "2_right_rotate",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
      },
      to: {
        position: { x: 0.2, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: { x: 1.5, y: 1.5, z: 1.5 },
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
    x: 0,
    y: 0,
    z: 0,
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
        type: "directional",
        color: 0xff0009,
        // color: 0xfff2db,
        intensity: 1,
        position: { x: 1000, y: 0.5, z: 1000 },
        //TODO: check position logic, is it pixels?
      },
      //   type: "directional",
      //   color: 0x002aff,
      //   intensity: 1000,
      //   position: { x: -1, y: -1, z: 1000 },
      // },
      // {
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
    x: 0.1,
    y: 0.1,
    z: 0.1,
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
        color: 0x000DFF,
        // color: 0xfff2db,
        intensity: 1,
        position: { x: -1000, y: 0.5, z: 1000 },
        //TODO: check position logic, is it pixels?
      },
      //   type: "directional",
      //   color: 0x002aff,
      //   intensity: 1000,
      //   position: { x: -1, y: -1, z: 1000 },
      // },
      // {
    ],
  },
});
</script>
<style lang="scss" scoped>
.frame-section {
  border: 1px solid red;
  height: 1000px;
}
.gltf-el {
  border: 1px solid purple;
  height: 750px;
  width: 750px;
  position: absolute;
  top: 0;
  left: 0;
}
.gltf2-el {
  border: 1px solid blue;
  height: 250px;
  width: 250px;
  position: absolute;
  top: 0;
  left: 0;
}
.content-block {
  position: relative;
  height: 100%;
  width: 100%;
}
.content {
  position: absolute;
  font-size: 155px;
}
</style>
