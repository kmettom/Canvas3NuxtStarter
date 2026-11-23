<template>
  <div class="page-container">
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
            }"
          >
            <div v-if="frame.content" class="">
              <Canvas3Text
                :class="`msdf-text ${frame.contentSize}`"
                :text="frame.content"
                :duration="1"
                ease="linear"
                theme="light"
                shader="textCRTG"
              />
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
    isSmallContent: boolean = false,
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
        y: isSmallContent ? -125 : 255,
        x: isSmallContent ? 50 : 100,
        transform: "matrix(1,0,1,2,0,0);",
      },
      0,
    );
    tl.set(text, { opacity: 0.8 }, 0);
    tl.to(
      chars,
      {
        y: 0,
        x: 0,
        delay: isSmallContent ? 0.15 : 0,
        duration: 0.55,
        transform: "matrix(1,0,0,1,0,0)",
        stagger: 0.025,
      },
      0,
    );
  };
  addTextToTimeline(el.querySelector(".sm-content.content-title-ani"), true);
};

const slideActivateOnceArray = ref<boolean[]>([]);
const slideActiveArray = ref<boolean[]>([]);

const setSlideActive = (elNode: HTMLElement, index: number) => {
  textAniIn(elNode, index);
  slideActivateOnceArray.value[index] = true;
  slideActiveArray.value[index] = true;
};

type KeyframeSection = {
  content?: string;
  smallContent?: string;
  position: { top: number; left?: number; right?: string };
  sectionSize?: number;
  contentSize?: string;
};

const keyframeSectionContent = ref<KeyframeSection[]>([
  {
    content: "Canvas3",
    smallContent: "nuxt module",
    position: { top: 50, left: 50 },
  },
  {
    content: "MSDF",
    smallContent: "Multi-Signed Distance Fields",
    position: { top: 50, left: 50 },
  },
  {
    content: "Font",
    // smallContent: "Render",
    position: { top: 0, left: 0 },
    sectionSize: 0.5
  },
  {
    content: "Render",
    // smallContent: "",
    position: { top: 0, left: 50 },
    sectionSize: 0.5

  },
  {
    content: "LINE",
    smallContent: "light settings",
    position: { top: 50, left: 50 },
  },
  {
    content: "CHARACTERS",
    smallContent: "position angle scale",
    position: { top: 50, left: 50 },
  },
  {
    content: "WORDS",
    smallContent: "position angle scale",
    position: { top: 50, left: 50 },
  },
  {
    content: "Get in",
    // smallContent: "",
    position: { top: 80, left: 50 },
    contentSize: "sm",
  },
]);

const viewportHeight = ref<number | null>(null);

onMounted(() => {
  viewportHeight.value = window.innerHeight;
});

const sectionStyle = (sectionSize = 1) => ({
  height: viewportHeight.value
    ? `${viewportHeight.value * sectionSize}px`
    : `${sectionSize * 100}vh`,
});
</script>

<style lang="scss" scoped>
.page-container {
  font-family: "PP Formula Black", serif;
  padding-top: 100px;
}
.frame-section {
  height: 100vh;
  position: relative;
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
.msdf-text {
  text-transform: uppercase;
  font-size: 450px;
  line-height: 95%;
  padding-top: 10px;
  @include respond-width($w-s) {
    font-size: 130px;
  }
  @include respond-width($w-xs) {
    font-size: 90px;
  }
  &.md {
    font-size: 350px;
  }
  &.sm {
    font-size: 250px;
  }
}
.sm-content-wrapper {
  overflow: hidden;
  position: relative;
  margin-top: -150px;
  text-align: center;
  @include respond-width($w-xs) {
    margin-top: -30px;
  }
}
.sm-content {
  font-family: "Mea Cupla", "serif";
  opacity: 0;
  overflow: hidden;
  padding-top: 0;
  margin-top: 0;
  padding-left: 5px;
  font-size: 80px;
  @include respond-width($w-s) {
    font-size: 65px;
  }
  @include respond-width($w-xs) {
    font-size: 50px;
  }
}
</style>
