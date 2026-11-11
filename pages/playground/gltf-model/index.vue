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
            <div v-if="frame.content" class="content-title content-title-ani">
              {{ frame.content }}
            </div>
            <div class="sm-content-wrapper">
              <div
                v-if="frame.smallContent"
                class="sm-content content-title-ani"
              >
                {{ frame.smallContent }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <scrollSpeedBar :show-photo-credentials="true" />
  </div>
</template>

<script setup lang="ts">
import ScrollSpeedBar from "~/components/playground/scroll-performance/scrollSpeedBar.vue";
import type { ScrollActionBinding } from "@canvas3/nuxt";
import SplitText from "gsap/SplitText";
import gsap from "gsap";
import {
  gltfAppearDavid,
  gltfLightingDavid,
  gltfPositioningDavid,
} from "~/utils/playground/gltf-model/gltf-david";
import {
  gltfAppearGeo,
  gltfLightingGeo,
  gltfPositioningGeo,
} from "~/utils/playground/gltf-model/gltf-geo";

gsap.registerPlugin(SplitText);

useSeoMeta({
  title: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogTitle: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  description: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogDescription: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
});

const textAniIn = (el: HTMLElement, slideIndex: number) => {
  if (slideActiveArray.value[slideIndex]) return;
  const tl = gsap.timeline({
    defaults: {
      ease: "power2.inOut",
    },
  });

  const addTextToTimeline = (
    text: Element | null,
    reverse: boolean = false,
  ) => {
    if (!text) return;
    const chars = new SplitText(text, {
      type: "chars",
      reduceWhiteSpace: false,
      charsClass: "char",
    }).chars;

    tl.set(
      chars,
      {
        y: reverse ? 125 : 255,
        x: reverse ? 50 : 100,
        transform: "matrix(1,0,1,2,0,0);",
        letterSpacing: "20px",
        // scale: 0,
      },
      0,
    );
    tl.set(text, { opacity: 0.8 }, 0);
    tl.to(
      // reverse ? chars.reverse() : chars,
      chars,
      {
        y: 0,
        x: 0,
        delay: reverse ? 0.15 : 0,
        duration: 0.55,
        transform: "matrix(1,0,0,1,0,0)",
        letterSpacing: 0,
        stagger: 0.025,
      },
      0,
    );
  };

  addTextToTimeline(
    el.querySelector(".content-title.content-title-ani"),
    false,
  );
  addTextToTimeline(el.querySelector(".sm-content.content-title-ani"), true);
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

type KeyframeSection = {
  content?: string;
  smallContent?: string;
  position: { top: number; left?: number; right?: string };
  sectionSize?: number;
};

const keyframeSectionContent = ref<KeyframeSection[]>([
  {
    content: "Canvas3",
    smallContent: "nuxt module",
    position: { top: 50, left: 50 },
  },
  {
    content: "GLTF",
    smallContent: "example",
    position: { top: 50, left: 50 },
    sectionSize: 1.5, //0.35
  },
  {
    content: "Create",
    smallContent: "story line",
    position: { top: 40, left: 50 },
    sectionSize: 1.25,
  },
  {
    content: "Change",
    smallContent: "light settings",
    position: { top: 50, left: 50 },
    sectionSize: 1.25,
  },
  {
    content: "Transform",
    smallContent: "position angle scale",
    position: { top: 50, left: 50 },
    sectionSize: 1.5,
  },
  {
    content: "Get",
    smallContent: "in touch",
    position: { top: 50, left: 50 },
  },
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

const gltfBindingDavid = ref({
  url: "/gltf/david_head/scene.gltf",
  name: "david",
  zIndex: 1,
  container: gltfElDavid.value,
  positioning: gltfPositioningDavid,
  appearAnimation: gltfAppearDavid,
  lighting: gltfLightingDavid,
});

const gltfBindingGeo = ref({
  url: "/gltf/icosidodecahedron/scene.gltf",
  name: "geometry",
  zIndex: 2,
  container: gltfElGeo.value,
  positioning: gltfPositioningGeo,
  appearAnimation: gltfAppearGeo,
  lighting: gltfLightingGeo,
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
  @include respond-width($w-s) {
    height: 450px;
    width: 450px;
  }
}
.gltf-geo-el {
  height: 250px;
  width: 250px;
  position: absolute;
  top: 0;
  left: 0;
  @include respond-width($w-s) {
    height: 150px;
    width: 150px;
  }
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
  font-size: 200px;
  line-height: 95%;
  padding-top: 10px;
  overflow: hidden;
  opacity: 0;
  text-wrap: nowrap;
  @include respond-width($w-s) {
    font-size: 110px;
  }
  @include respond-width($w-xs) {
    font-size: 75px;
  }
}
.sm-content-wrapper {
  overflow: hidden;
  position: relative;
  margin-top: -35px;
  text-align: center;
}
.sm-content {
  font-family: "Mea Cupla", "serif";
  opacity: 0;
  overflow: hidden;
  padding-top: 0;
  margin-top: 0;
  padding-left: 5px;
  font-size: 75px;
  //line-height: 100%;
  //text-transform: uppercase;
  @include respond-width($w-s) {
    font-size: 55px;
  }
  @include respond-width($w-xs) {
    font-size: 35px;
  }
}
</style>
