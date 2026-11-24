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
              activeRange: index == 0 ? 1 : 1,
              activateOnce: true,
              scrollSpeedSetTo: {
                value: frame.scrollSpeed ? frame.scrollSpeed : 0,
                duration: 0,
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
                  theme: 'dark',
                  uniforms: {
                    uTextAniIn: {
                      value: slideActivateOnceArray[index] ? 1 : 0,
                      duration: index == 0 ? 1.35 : 0.65,
                      ease: 'linear',
                    },
                    uSweepAngle: { value: frame.sweepAngle ?? 0 },
                  },
                }"
                style="color: transparent"
                :class="`msdf-text ${frame.contentSize}`"
              >
                {{ frame.content }}
              </div>
            </div>
            <div
              :class="`sm-content-wrapper ${frame.smContentPushUp ? ' push-up' : ''}`"
            >
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
    <div class="frame-section contact-section" :style="sectionStyle(1)">
      <div class="content-block">
        <div
          class="content-wrapper"
          :style="`top:${contactSection.position.top}%;left:${contactSection.position.left}%;transform:translate(-${contactSection.position.left ?? 0}%,-${contactSection.position.top}%)`"
        >
          <div
            v-canvas3-scroll-action="{
              activeRange: 1,
              activateOnce: true,
              activateCallback: (item) => {
                textAniIn(item.elNode, 99, true);
                contactSectionActive = true;
              },
            }"
          >
            <div class="">
              <div
                v-canvas3-text="{
                  shaderName: 'textCRTG',
                  theme: 'dark',
                  uniforms: {
                    uTextAniIn: {
                      value: contactSectionActive ? 1 : 0,
                      duration: 0.65,
                      ease: 'linear',
                    },
                    uSweepAngle: { value: contactSection.sweepAngle ?? 0 },
                  },
                }"
                style="color: transparent"
                class="msdf-text"
              >
                {{ contactSection.content }}
              </div>
            </div>
            <div
              :class="`sm-content-wrapper ${contactSection.smContentPushUp ? ' push-up' : ''}`"
            >
              <div class="sm-content content-title-ani">
                {{ contactSection.smallContent }}
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

const textAniIn = (
  el: HTMLElement,
  slideIndex: number,
  isContact: boolean = false,
) => {
  if (slideActiveArray.value[slideIndex] && !isContact) return;
  const tl = gsap.timeline({
    defaults: {
      ease: "power2.inOut",
    },
  });

  const selector = ".sm-content.content-title-ani";
  const textEl = el.querySelector(selector);
  if (!textEl) return;

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

const contactSectionActive = ref<boolean>(false);
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
  scrollSpeed?: number;
  smContentPushUp?: boolean;
  sweepAngle?: number;
};

const keyframeSectionContent = ref<KeyframeSection[]>([
  {
    content: "Canvas3",
    smallContent: "nuxt module",
    position: { top: 30, left: 50 },
    smContentPushUp: true,
  },
  {
    content: "MSDF",
    smallContent: "Multi-Signed Distance Fields",
    position: { top: 50, left: 50 },
    sweepAngle: 270,
    contentSize: "xl",
    smContentPushUp: true,
  },
  {
    content: "Font",
    position: { top: 0, left: 0 },
    sectionSize: 0.5,
    contentSize: "sm",
    scrollSpeed: 0.2,
    sweepAngle: 0,
  },
  {
    content: "Render",
    position: { top: 0, right: "0" },
    sectionSize: 0.5,
    contentSize: "sm",
    sweepAngle: 180,
  },
  {
    content: "Playground",
    smallContent: "nuxt directive, Three.js font render",
    position: { top: 50, left: 50 },
    contentSize: "sm",
    sweepAngle: 0,
  },
  {
    content: "Easy",
    position: { top: 50, left: 10 },
    contentSize: "sm",
    scrollSpeed: 0.2,
    sweepAngle: 180,
    sectionSize: 0.5,
  },
  {
    content: "Setup",
    position: { top: 50, right: "10" },
    contentSize: "sm",
    scrollSpeed: -0.2,
    sweepAngle: 0,
    sectionSize: 0.5,
  },
  {
    content: "Full",
    position: { top: 50, left: 50 },
    contentSize: "md",
    scrollSpeed: 0.1,
    sweepAngle: 0,
    sectionSize: 0.5,
  },
  {
    content: "Control",
    smallContent: "directives & uniforms",
    position: { top: 50, left: 50 },
    contentSize: "md",
    sweepAngle: 180,
    smContentPushUp: true,
  },
  {
    content: "Developed",
    smallContent: "by Tomas Kmet",
    position: { top: 50, left: 50 },
    contentSize: "md",
    sweepAngle: 270,
  },
  // {
  //   content: "GET",
  //   smallContent: "in touch",
  //   position: { top: 50, left: 50 },
  //   smContentPushUp: true,
  // },
]);

const contactSection = ref<KeyframeSection>({
  content: "GET",
  smallContent: "in touch",
  position: { top: 50, left: 50 },
  smContentPushUp: true,
  sweepAngle: 0,
});

const viewportHeight = ref<number | null>(null);

const sectionStyle = (sectionSize = 1) => ({
  height: viewportHeight.value
    ? `${viewportHeight.value * sectionSize}px`
    : `${sectionSize * 100}vh`,
});

const navigationStore = useNavigationStore();
const displayStore = useDisplayStore();

onMounted(() => {
  viewportHeight.value = displayStore.isMobile
    ? window.innerHeight / 1.25
    : window.innerHeight;
  setTimeout(() => {
    Canvas3.setScrollShaderByName("msdfPlayground");
  }, 0);
  setTimeout(() => {
    navigationStore.setCanvas3zIndex(10);
  }, 1500);
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
  font-size: 425px;
  line-height: 95%;
  padding-top: 10px;
  @include respond-width($w-m) {
    font-size: 330px;
  }
  @include respond-width($w-m-s) {
    font-size: 300px;
  }
  @include respond-width($w-s) {
    font-size: 250px;
  }
  @include respond-width($w-xs) {
    font-size: 115px;
  }
  &.xl {
    font-size: 450px;
    @include respond-width($w-s) {
      font-size: 300px;
    }
    @include respond-width($w-xs) {
      font-size: 145px;
    }
  }
  &.md {
    font-size: 350px;
    @include respond-width($w-s) {
      font-size: 220px;
    }
    @include respond-width($w-xs) {
      font-size: 100px;
    }
  }
  &.sm {
    font-size: 300px;
    @include respond-width($w-s) {
      font-size: 190px;
    }
    @include respond-width($w-xs) {
      font-size: 95px;
    }
  }
}
.sm-content-wrapper {
  overflow: hidden;
  position: relative;
  margin-top: -5px;
  text-align: center;
  @include respond-width($w-xs) {
    margin-top: 0;
  }
  &.push-up {
    margin-top: -65px;
    @include respond-width($w-m) {
      margin-top: -40px;
    }
    @include respond-width($w-s) {
      margin-top: -20px;
    }
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
