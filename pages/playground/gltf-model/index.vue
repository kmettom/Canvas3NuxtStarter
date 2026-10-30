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
      :style="sectionStyle(frame.sectionSize)"
    >
      <div class="content-block">
        <div
          class="content-wrapper"
          :style="`top:${frame.position.top}%;left:${frame.position.left ?? 0}%;${frame.position.right ? `right:${frame.position.right}%` : ''};transform:translate(-${frame.position.left ?? 0}%,-${frame.position.top}%)`"
        >
          <div
            v-canvas3-scroll-action="{
              activeRange: 0.95,
              activateOnce: false,
              activateCallback: (item: ScrollActionBinding) => {
                setSlideActive(item.elNode, index);
              },
              deactivateCallback: (item: ScrollActionBinding) => {
                setSlideNonActive(item.elNode, index);
              },
            }"
          >
            <div v-if="frame.content" class="content-title">
              {{ frame.content }}
            </div>
            <div class="sm-content-wrapper">
              <div v-if="frame.smallContent" class="sm-content">
                {{ frame.smallContent }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <scrollSpeedBar :show-photo-credentials="false" />
  </div>
</template>

<script setup lang="ts">
import ScrollSpeedBar from "~/components/playground/scroll-performance/scrollSpeedBar.vue";
import type { ScrollActionBinding } from "@canvas3/nuxt";
import SplitText from "gsap/SplitText";
import gsap from "gsap";

gsap.registerPlugin(SplitText);

useSeoMeta({
  title: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogTitle: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  description: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogDescription: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
});

const textAniIn = (el: HTMLElement, slideIndex: number) => {
  if (slideActiveArray.value[slideIndex]) return;
  console.log("textAniIn");
  const text = el.querySelector(".content-title");
  const chars = new SplitText(text, {
    type: "chars",
    reduceWhiteSpace: false,
    charsClass: "char",
  }).chars;

  const tl = gsap.timeline({
    defaults: {
      ease: "power2.inOut",
    },
  });
  tl.set(chars, {
    y: 255,
    x: 100,
    transform: "matrix(1,0,1,2,0,0)",
  });
  tl.set(text, { opacity: 1 });
  tl.to(chars, {
    y: 0,
    x: 0,
    duration: 0.35,
    transform: "matrix(1,0,0,1,0,0)",
    stagger: 0.025,
  });
};

const slideActivateOnceArray = ref<boolean[]>([]);
const slideActiveArray = ref<boolean[]>([]);

const setSlideActive = (elNode: HTMLElement, index: number) => {
  const timeoutTime = index <= 3 ? 500 : 0;
  setTimeout(() => {
    // if (!slideActivateOnceArray.value[index]) {
    textAniIn(elNode, index);
    // };
    slideActivateOnceArray.value[index] = true;
    slideActiveArray.value[index] = true;
  }, timeoutTime);
};

const textAniOut = (el: HTMLElement, slideIndex: number) => {
  if (slideActiveArray.value[slideIndex]) return;
  console.log("textAniIn");
  const text = el.querySelector(".content-title");
  const chars = new SplitText(text, {
    type: "chars",
    reduceWhiteSpace: false,
    charsClass: "char",
  }).chars;

  const tl = gsap.timeline({
    defaults: {
      // ease: "power2.inOut",
    },
  });
  // tl.set(chars, {
  //
  //   transform: "matrix(1,0,1,2,0,0)",
  // });
  tl.to(chars, {
    y: 255,
    x: 100,
    duration: 0.25,
    transform: "matrix(1,0,0,1,0,0)",
    stagger: 0.015,
  });
  tl.set(text, { opacity: 0 });
};

const setSlideNonActive = (elNode: HTMLElement, index: number) => {
  slideActiveArray.value[index] = false;
  textAniOut(elNode, index);
};

const gltfElDavid = ref(null);
const gltfElGeo = ref(null);

type KeyframeSection = {
  content?: string;
  smallContent?: string;
  position: { top: number; left?: number; right?: string };
  sectionSize?: number;
};

const keyframeSectionContent = ref<KeyframeSection[]>([
  {
    content: "Canvas3",
    smallContent: "Nuxt module for ThreeJS and animation features",
    position: { top: 50, left: 50 },
  },
  {
    content: "GLTF",
    position: { top: 50, left: 0 },
    smallContent: "Playground for GLTF imports",
    sectionSize: 1.5,
  },
  {
    content: "Create",
    position: { top: 0, left: 0 },
    sectionSize: 0.5,
  },
  {
    content: "story",
    position: { top: 0, left: 50 },
    sectionSize: 0.5,
  },
  {
    content: "line",
    position: { top: 0, right: "0" },
    sectionSize: 0.5,
  },
  {
    content: "Change",
    position: { top: 0, left: 0 },
  },
  {
    content: "Light",
    position: { top: 0, left: 0 },
  },
  {
    smallContent: "per",
    position: { top: 0, left: 0 },
  },
  {
    smallContent: "model",
    position: { top: 0, left: 0 },
  },
  {
    content: "Transform",
    position: { top: 0, left: 0 },
  },
  {
    smallContent: "Position",
    position: { top: 0, left: 0 },
  },
  {
    smallContent: "Rotate",
    position: { top: 0, left: 0 },
  },
  {
    smallContent: "Scale",
    position: { top: 0, left: 0 },
  },
]);

// 100vh until mounted, then locked to window.innerHeight
const viewportHeight = ref<number | null>(null);

onMounted(() => {
  viewportHeight.value = window.innerHeight;
});

const sectionStyle = (sectionSize = 1) => ({
  height: viewportHeight.value
    ? `${viewportHeight.value * sectionSize}px`
    : `${sectionSize * 100}vh`,
});

const gltfPositioningDavid = ref({
  keyframes: [
    {
      id: "1_start_to_right",
      start: 0,
      end: 0.1,
      from: {
        position: { x: -0.45, y: -0.45, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: { davidKey: { intensity: 1, position: { x: 1, y: 0, z: 0 } } },
      },
      to: {
        position: { x: 0, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        lights: { davidKey: { intensity: 1, position: { x: 0, y: 0, z: 1 } } },
      },
    },
    {
      id: "2_right_rotate",
      start: 0.1,
      end: 0.2,
      from: {
        position: { x: 0, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        lights: { davidKey: { intensity: 1, position: { x: 0, y: 0, z: 1 } } },
      },
      to: {
        position: { x: 0.4, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI * 2, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: { davidKey: { intensity: 1, position: { x: 0, y: 0, z: 1 } } },
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
    x: -0.025,
    y: -0.025,
    z: -0.025,
  },
});

const gltfAppearDavid = {
  duration: 2000,
  ease: "power3.out",
  from: {
    position: { x: -0.45, y: -0.9, z: 0 },
    rotation: { x: 0, y: -Math.PI, z: 0 },
    scale: { x: 0.4, y: 0.4, z: 0.4 },
    lights: { davidKey: { intensity: 0, position: { x: -1, y: 0, z: 0 } } },
  },
  to: {
    position: { x: -0.45, y: -0.45, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    lights: { davidKey: { intensity: 1, position: { x: 1, y: 0, z: 0 } } },
  },
};

const gltfBindingDavid = ref({
  url: "/gltf/david_head/scene.gltf",
  name: "david",
  container: gltfElDavid.value,
  positioning: gltfPositioningDavid.value,
  appearAnimation: gltfAppearDavid,
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
    z: -0.5,
  },
});

const gltfAppearGeo = {
  duration: 1200,
  delay: 600,
  ease: "back.out(1.7)",
  from: {
    position: { x: 0.35, y: 0.15, z: 0 },
    rotation: { x: -Math.PI, y: -Math.PI, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
  },
  to: {
    position: { x: 0.35, y: 0.15, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  },
};

const gltfBindingGeo = ref({
  url: "/gltf/icosidodecahedron/scene.gltf",
  name: "geometry",
  container: gltfElGeo.value,
  positioning: gltfPositioningGeo.value,
  appearAnimation: gltfAppearGeo,
  lighting: {
    environment: "room",
    environmentIntensity: 0.2,
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
.page-container {
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
  height: 100vh;
  position: relative;
  border: 1px solid red;
}
.content-block {
  position: relative;
  height: 100%;
  width: 100%;
}
.content-wrapper {
  overflow: hidden;
  position: absolute;
}
.content-title {
  text-transform: uppercase;
  font-size: 155px;
  line-height: 90%;
  padding-top: 10px;
  overflow: hidden;
  opacity: 0;
}
.sm-content-wrapper {
  overflow: hidden;
}
.sm-content {
  //opacity: 0;
  padding-left: 5px;
  font-size: 25px;
  text-transform: uppercase;
}
</style>
