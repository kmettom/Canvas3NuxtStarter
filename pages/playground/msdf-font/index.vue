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
          :style="`top:${frame.position.top}%;${frame.position.left ? `left:${frame.position.left}%` : '0%'};${frame.position.right ? `right:0%` : ''};transform:translate(-${frame.position.left ?? 0}%,-${frame.position.top}%)`"
        >
          <div
            v-canvas3-scroll-action="{
              activeRange: 1,
              activateOnce: true,
              scrollSpeedSetTo: {
                value: frame.scrollSpeed ? frame.scrollSpeed : 0,
                duration: 0.2,
                ease: 'linear',
              },
              activateCallback: (item: ScrollActionBinding) => {
                setSlideActive(item.elNode, index);
              },
            }"
          >
            <div v-if="frame.content" class="">
              <div
                v-canvas3-text="{
                  shaderName: 'textCRTG',
                  theme: 'light',
                  uniforms: {
                    uTextAniIn: {
                      value: slideActivateOnceArray[index] ? 1 : 0,
                      duration: index == 0 ? 1.25 : 0.75,
                      ease: 'linear',
                    },
                  },
                }"
                style="color: transparent"
                :class="`msdf-text ${frame.contentSize}`"
              >
                {{ frame.content }}
              </div>
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

  const selector = ".sm-content.content-title-ani";
  const textEl = el.querySelector(selector);

  const chars = new SplitText(textEl, {
    type: "chars",
    reduceWhiteSpace: false,
    charsClass: "char",
  }).chars;

  tl.set(
    chars,
    {
      y: -125,
      x: 50,
      transform: "matrix(1,0,1,2,0,0);",
    },
    0,
  );
  tl.set(textEl, { opacity: 0.8 }, 0);
  tl.to(
    chars,
    {
      y: 0,
      x: 0,
      delay: 0.15,
      duration: 0.55,
      transform: "matrix(1,0,0,1,0,0)",
      stagger: 0.025,
    },
    0,
  );
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
  position: { top: number; left?: number; right?: boolean };
  sectionSize?: number;
  contentSize?: string;
  scrollSpeed?: number;
};

const keyframeSectionContent = ref<KeyframeSection[]>([
  {
    content: "Canvas3",
    smallContent: "nuxt module",
    position: { top: 30, left: 50 },
  },
  {
    content: "MSDF",
    smallContent: "Multi-Signed Distance Fields",
    position: { top: 50, left: 50 },
  },
  {
    content: "Font",
    position: { top: 0, left: 10 },
    sectionSize: 0.5,
    contentSize: "sm",
    scrollSpeed: 0.2,
  },
  {
    content: "Render",
    position: { top: 0, right: true },
    sectionSize: 0.5,
    contentSize: "sm",
  },
  {
    content: "Example",
    position: { top: 50, left: 50 },
    sectionSize: 0.5,
    scrollSpeed: -0.2,
    contentSize: "sm",
  },
  {
    content: "Developed",
    position: { top: 50, left: 50 },
    contentSize: "md",
    scrollSpeed: 0.2,
  },
  {
    content: "by",
    // smallContent: "position angle scale",
    position: { top: 50, left: 50 },
    contentSize: "sm",
    sectionSize: 0.5,
  },
  {
    content: "Tomas",
    smallContent: "Kmet",
    position: { top: 50, left: 50 },
  },
  // {
  //   content: "Kmet",
  //   smallContent: "position angle scale",
  //   position: { top: 50, left: 50 },
  // },
  {
    content: "GET",
    smallContent: "in touch",
    position: { top: 50, left: 50 },
  },
]);

const viewportHeight = ref<number | null>(null);

const sectionStyle = (sectionSize = 1) => ({
  height: viewportHeight.value
    ? `${viewportHeight.value * sectionSize}px`
    : `${sectionSize * 100}vh`,
});

onMounted(() => {
  viewportHeight.value = window.innerHeight;
  setTimeout(() => {
    Canvas3.setScrollShaderByName("msdfPlayground");
  }, 0);
});

onBeforeUnmount(() => {
  Canvas3.setScrollShaderByName("msdfPlayground");
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
  &.xs {
    font-size: 100px;
  }
}
.sm-content-wrapper {
  overflow: hidden;
  position: relative;
  margin-top: -50px;
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
#fixedTextEl {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
  transition: ease all 0.5s;
  opacity: 0;
}
</style>
