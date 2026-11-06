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
          :style="`top:${frame.position.top}%;${frame.position.left ? `left:${frame.position.left}%` : '0%'};${frame.position.right ? `right:${frame.position.right}%` : ''};transform:translate(-${frame.position.left ?? 0}%,-${frame.position.top}%)`"
        >
          <div
            v-canvas3-scroll-action="{
              activeRange: 0.99,
              activateOnce: false,
              activateCallback: (item: ScrollActionBinding) => {
                setSlideActive(item.elNode, index);
              },
              deactivateCallback: (item: ScrollActionBinding) => {
                // setSlideNonActive(item.elNode, index);
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
  const text = el.querySelector(".content-title");
  const textSm = el.querySelector(".sm-content");
  const chars = new SplitText(text, {
    type: "chars",
    reduceWhiteSpace: false,
    charsClass: "char",
  }).chars;

  const charsSm = new SplitText(textSm, {
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
  tl.set(charsSm, {
    y: 55,
    x: 10,
    transform: "matrix(1,0,1,2,0,0)",
  });
  tl.set(text, { opacity: 1 });
  tl.set(textSm, { opacity: 1 });
  tl.to(chars, {
    y: 0,
    x: 0,
    duration: 0.35,
    transform: "matrix(1,0,0,1,0,0)",
    stagger: 0.025,
  });
  tl.to(
    charsSm,
    {
      y: 0,
      x: 0,
      duration: 0.35,
      transform: "matrix(1,0,0,1,0,0)",
      stagger: 0.005,
    },
    "<+0.2",
  );
};

const slideActivateOnceArray = ref<boolean[]>([]);
const slideActiveArray = ref<boolean[]>([]);

const setSlideActive = (elNode: HTMLElement, index: number) => {
  textAniIn(elNode, index);
  slideActivateOnceArray.value[index] = true;
  slideActiveArray.value[index] = true;
};

const gltfElDavid = ref(null);
const gltfElGeo = ref(null);

const baseColor = 0xf0eee9;
const pinkColor = 0xdb00ff;
const blueColor = 0x00fffb;
const yellowColor = 0xffec76;
const redColor = 0xff0065;

const baseEnvIntensity = 0.05;
const baseLightPositionRight = { x: 1, y: 0, z: 0.2 };
const baseLightPositionLeft = { x: -1, y: 0, z: 0.2 };

type KeyframeSection = {
  content?: string;
  smallContent?: string;
  position: { top: number; left?: number; right?: string };
  sectionSize?: number;
};

const keyframeSectionContent = ref<KeyframeSection[]>([
  {
    content: "Canvas3",
    position: { top: 50, left: 50 },
  },
  {
    content: "GLTF",
    position: { top: 50, left: 0 },
    sectionSize: 0.35,
  },
  {
    content: "Example",
    position: { top: 0, right: "0" },
    sectionSize: 1.25,
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
    sectionSize: 0.5,
  },
  {
    content: "Light",
    position: { top: 0, right: "0" },
    sectionSize: 0.5,
  },
  {
    content: "settings",
    position: { top: 0, left: 0 },
    sectionSize: 0.5,
  },
  {
    content: "Transform",
    position: { top: 50, left: 50 },
  },
  {
    smallContent: "Position",
    position: { top: 0, left: 50 },
    sectionSize: 0.5,
  },
  {
    smallContent: "Rotate",
    position: { top: 0, left: 50 },
    sectionSize: 0.5,
  },
  {
    smallContent: "Scale",
    position: { top: 0, left: 50 },
    sectionSize: 0.5,
  },
  {
    content: "Get in touch",
    position: { top: 50, left: 50 },
    // sectionSize: 0.5,
  },
  // {
  //   smallContent: "with Performance",
  //   position: { top: 0, left: 50 },
  // },
]);

console.log(keyframeSectionContent.value.length);
// 13 screens, 1 keyframe 1/13 -> 6x0.5 + 7 = 10

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
      id: "1_left_to_middle",
      start: 0,
      end: 0.1,
      from: {
        position: { x: -0.45, y: -0.45, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      to: {
        position: { x: 0, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
      },
    },
    {
      id: "2_middle_to_right",
      start: 0.1,
      end: 0.2,
      from: {
        position: { x: 0, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
      },
      to: {
        position: { x: 0.4, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI * 2.5, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "3_right_stay_rotate",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: 0.4, y: -0.45, z: 0 },
        rotation: { x: 0, y: -Math.PI * 2.5, z: 0 },
      },
      to: {
        position: { x: 0.4, y: -0.5, z: 0 },
        rotation: { x: Math.PI / 8, y: -Math.PI * 2, z: 0 },
      },
    },
    {
      id: "4_to_middle_light",
      start: 0.4,
      end: 0.5,
      from: {
        position: { x: 0.4, y: -0.5, z: 0 },
        rotation: { x: Math.PI / 8, y: 0, z: 0 },
        lights: { davidKey: { intensity: 1, color: baseColor } },
      },
      to: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: 1, y: 0, z: 0.1 },
            color: pinkColor,
          },
        },
      },
    },
    {
      id: "5_light_mid",
      start: 0.5,
      end: 0.6,
      from: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            position: { x: 1, y: 0, z: 0.1 },
          },
        },
      },
      to: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            position: { x: 0, y: 1, z: 0 },
          },
        },
      },
    },
    {
      id: "6_light_left",
      start: 0.6,
      end: 0.7,
      from: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: 0, y: 1, z: 0 },
            color: pinkColor,
          },
        },
      },
      to: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
        },
      },
    },
    {
      id: "7_pos_rotate_scale_1",
      start: 0.7,
      end: 0.8,
      from: {
        position: { x: 0, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 8, z: 0 },
        lights: {
          davidKey: {
            intensity: 2,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 0,
            position: { x: 0, y: 0, z: 0 },
            color: yellowColor,
          },
        },
      },
      to: {
        position: { x: -0.2, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 6, z: 0 },
        lights: {
          davidKey: {
            intensity: 0,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 1,
            position: { x: 1, y: 0, z: 0 },
            color: redColor,
          },
        },
      },
    },
    {
      id: "8_transform",
      start: 0.8,
      end: 0.9,
      from: {
        position: { x: -0.2, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 6, z: 0 },
        lights: {
          davidKey: {
            intensity: 0,
            position: { x: -1, y: 1, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 1,
            position: { x: 1, y: 0, z: 0 },
          },
        }
      },
      to: {
        position: { x: -0.2, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 6, z: 0 },
        lights: {
          davidKey: {
            intensity: 1,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
          davidKey2: {
            intensity: 2,
            position: { x: 1, y: 1, z: 0 },
          },
        }
      },
    },
    {
      id: "9_transform_final",
      start: 0.9,
      end: 1,
      from: {
        position: { x: -0.2, y: -0.5, z: 0 },
        rotation: { x: 0, y: Math.PI / 6, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          davidKey: {
            intensity: 1,
            position: { x: -1, y: 0, z: 0 },
            color: blueColor,
          },
        }
      },
      to: {
        position: { x: -0.35, y: -0.2, z: 0 },
        rotation: { x: 0, y: Math.PI / 3, z: 0 },
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        lights: {
          davidKey: {
            intensity: 1,
            position: baseLightPositionRight,
            color: blueColor,
          },
        }
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
    lights: { davidKey: { intensity: 0, position: { x: 0, y: 0, z: 0 } } },
  },
  to: {
    position: { x: -0.45, y: -0.45, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    lights: { davidKey: { intensity: 1, position: baseLightPositionRight } },
  },
};

const gltfBindingDavid = ref({
  url: "/gltf/david_head/scene.gltf",
  name: "david",
  zIndex: 1,
  container: gltfElDavid.value,
  positioning: gltfPositioningDavid.value,
  appearAnimation: gltfAppearDavid,
  lighting: {
    environment: "room",
    environmentIntensity: baseEnvIntensity,
    toneMapping: "aces",
    exposure: 1,
    defaultLights: false,
    lights: [
      {
        id: "davidKey",
        type: "directional",
        color: baseColor,
        intensity: 0,
        position: { x: 0, y: 0, z: 0 },
      },
      {
        id: "davidKey2",
        type: "directional",
        color: blueColor,
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
      end: 0.1,
      from: {
        position: { x: 0.45, y: 0.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.2, y: 1.2, z: 1.2 },
      },
      to: {
        position: { x: 0, y: 0.1, z: 0 },
        rotation: { x: Math.PI, y: Math.PI, z: 0 },
        scale: { x: 2.5, y: 2.5, z: 2.5 },
      },
    },
    {
      id: "2_to_middle",
      start: 0.1,
      end: 0.2,
      from: {
        position: { x: 0, y: 0.1, z: 0 },
        rotation: { x: Math.PI, y: Math.PI, z: 0 },
        scale: { x: 2.5, y: 2.5, z: 2.5 },
      },
      to: {
        position: { x: -0.35, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 1, y: 1, z: 1 },
      },
    },
    {
      id: "3_to_left",
      start: 0.2,
      end: 0.4,
      from: {
        position: { x: -0.35, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 1, y: 1, z: 1 },
        zIndex: 2,
      },
      to: {
        position: { x: 0.55, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI * 2 },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        zIndex: 2,
      },
    },
    {
      id: "3_to_left",
      start: 0.4,
      end: 0.7,
      from: {
        position: { x: 0.55, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI * 2 },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        zIndex: 2,
      },
      to: {
        position: { x: 0.55, y: -0.2, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI * 2 },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        zIndex: 0,
      },
    },
    {
      id: "4_scale_up_right",
      start: 0.7,
      end: 0.8,
      from: {
        position: { x: -0.55, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        lights: {
          geoKey: {
            intensity: 1,
            position: baseLightPositionRight,
            color: baseColor,
          },
        },
        zIndex: 0,
      },
      to: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
        lights: {
          geoKey: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: redColor,
          },
        },
        zIndex: 0,
      },
    },
    {
      id: "5_transform",
      start: 0.8,
      end: 0.9,
      from: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2, y: 2, z: 2 },
        lights: {
          geoKey: { color: redColor },
          geoKey2: {
            intensity: 0,
            position: baseLightPositionRight,
            color: blueColor,
          },
        },
      },
      to: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: Math.PI / 8, y: Math.PI / 12, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          geoKey: {
            color: redColor,
            intensity: 2,
            position: { x: -1, y: 1, z: 0 },
          },
          geoKey2: {
            intensity: 1,
            position: baseLightPositionLeft,
            color: blueColor,
          },
        },
      },
    },
    {
      id: "6_transform_final",
      start: 0.9,
      end: 1,
      from: {
        position: { x: 0.25, y: 0, z: 0 },
        rotation: { x: Math.PI / 8, y: Math.PI / 12, z: Math.PI / 2 },
        scale: { x: 1, y: 1, z: 1 },
        lights: {
          geoKey: { color: redColor },
          geoKey2: {
            intensity: 1,
            position: baseLightPositionRight,
            color: blueColor,
          },
        },
      },
      to: {
        position: { x: 0.35, y: 0.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.7, y: 0.7, z: 0.7 },
        lights: {
          geoKey: { color: redColor },
          geoKey2: {
            intensity: 1,
            position: baseLightPositionRight,
            color: blueColor,
          },
        },
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
  delay: 300,
  ease: "back.out(2)",
  from: {
    position: { x: 0.55, y: 0.05, z: 0 },
    rotation: { x: -Math.PI, y: -Math.PI, z: 0 },
    scale: { x: 0, y: 0, z: 0 },
  },
  to: {
    position: { x: 0.45, y: 0.05, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1.2, y: 1.2, z: 1.2 },
  },
};

const gltfBindingGeo = ref({
  url: "/gltf/icosidodecahedron/scene.gltf",
  name: "geometry",
  zIndex: 2,
  container: gltfElGeo.value,
  positioning: gltfPositioningGeo.value,
  appearAnimation: gltfAppearGeo,
  lighting: {
    environment: "room",
    environmentIntensity: baseEnvIntensity,
    toneMapping: "aces",
    exposure: 1,
    defaultLights: false,
    lights: [
      {
        id: "geoKey",
        type: "directional",
        color: baseColor,
        intensity: 1,
        position: baseLightPositionLeft,
      },
      {
        id: "geoKey2",
        type: "directional",
        color: redColor,
        intensity: 0,
        position: baseLightPositionRight,
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
  //border: 1px solid red;
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
  opacity: 0;
  overflow: hidden;
  padding-left: 5px;
  font-size: 75px;
  text-transform: uppercase;
}
</style>
