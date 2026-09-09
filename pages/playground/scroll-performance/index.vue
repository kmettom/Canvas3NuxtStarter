<template>
  <div class="page-container">
    <scrollSpeedBar />
    <div
      id="layoutNavigation"
      v-canvas3-scroll-action="layoutNavigationOptions"
      class="layout-nav-container"
    >
      <div class="nav-holder">
        <div @click="() => layoutChangeSwitch()"
        @mouseenter="() => navHoverAni()"
        >
          <div class="nav-icon">
            <div class="nav-icon-line" />
            <div class="nav-icon-line" />
            <div class="nav-icon-line" />
          </div>
        </div>
      </div>
    </div>
    <div class="sections-container">
      <div
        v-for="(slide, index) in slides"
        :key="index"
        :ref="slidesRefs.set"
        class="slide"
        :style="`margin-left:${slide.position * 33}%`"
        :data-item-position="slide.position"
      >
                        {{index}}
        <div
          v-canvas3-scroll-action="{
            activeRange: 0.95,
            activateOnce: false,
            scrollSpeedSetTo: {
              value: layoutSmall ? 0 : (slide.scrollSpeed ?? 0),
              duration: layoutChangeDuration,
            },
            activateCallback: (item: ScrollActionBinding) => {
              setSlideActive(item.elNode, slide.text, index);
            },
            deactivateCallback: () => {
              setSlideNonActive(index);
            },
          }"
        >
          <div>{{ index }}</div>
          <img
            v-if="slide.image"
            v-canvas3-image="{
              shaderName: 'playScrollPerformance',
              uniforms: {
                uAniIn: {
                  value: slideActivateOnceArray[index] ? 1 : 0,
                  duration: index <= 3 ? 1 : 0.4,
                  ease: index <= 3 ? 'power2.inOut' : 'linear',
                },
                uLayoutChangeProgress: {
                  value: layoutChangeUniform,
                  duration: layoutChangeDuration,
                  ease: 'power2.inOut',
                },
                uLayoutChangeDirection: {
                  value: layoutSmall ? -1 : 1,
                  duration: 0,
                  ease: 'power2.inOut',
                },
              },
            }"
            :src="slide.image"
            class="slide-image"
            :loading="index <= 3 ? 'eager' : 'lazy'"
            alt=""
          />
          <div v-if="slide.text" class="slide-text">{{ slide.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
// TODO BEFORE RELEASE:
// - first init test - image can be not loaded in some conditions - investigate from TK.com
// - layout change causes text to flinch

import type { ScrollActionBinding } from "../../../../canvas3-nuxt/dist/runtime/types/types";
import gsap from "gsap";
import { useTemplateRefsList } from "@vueuse/core";
import SplitText from "gsap/SplitText";
import scrollSpeedBar from "~/components/playground/scroll-performance/scrollSpeedBar.vue";

gsap.registerPlugin(SplitText);

const slidesRefs = useTemplateRefsList<HTMLElement>();

const slideActivateOnceArray = ref<boolean[]>([]);
const slideActiveArray = ref<boolean[]>([]);

const layoutSmall = ref(false);

const layoutNavigationOptions = computed(() => ({
  activeRange: 1,
  fixToParent: {
    containerId: "layoutNavigation",
    fixPosition: 0,
    margin: 0,
  },
}));

const setSlideNonActive = (index: number) => {
  slideActiveArray.value[index] = false;
};

const setSlideActive = (
  elNode: HTMLElement,
  slideText: string | undefined,
  index: number,
) => {
  const timeoutTime = index <= 3 ? 100 : 0;
  setTimeout(() => {
    if (slideText && !slideActivateOnceArray.value[index])
      textAniIn(elNode, index);
    slideActivateOnceArray.value[index] = true;
    slideActiveArray.value[index] = true;
  }, timeoutTime);
};

const textAniIn = (el: HTMLElement, slideIndex: number) => {
  if (slideActiveArray.value[slideIndex]) return;
  const text = el.querySelector(".slide-text");
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
    y: 155,
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

const navHoverAni = () => {
  const hoverTl = gsap.timeline({yoyo: true, repeat: 1});
  hoverTl.to(".nav-icon-line", {
    transform: 'scale(1.3)',
    stagger: 0.05,
    duration: 0.2,
    ease: "linear",
  });
}

const layoutSwitchInProgress = ref(false);
const layoutChangeUniform = ref(0);
const layoutChangeDuration = 0.75;

const layoutChangeTl = gsap.timeline({
  defaults: { ease: "power2.inOut", duration: layoutChangeDuration },
  ease: "power2.inOut",
  onUpdate: () => {
    Canvas3.setMeshPositionsUpdate(true);
    const progress = layoutChangeTl.progress();
    if (progress > 0.5 && layoutChangeUniform.value === 1) {
      layoutChangeUniform.value = 0;
    }
  },
  onComplete: () => {
    layoutSwitchInProgress.value = false;
    Canvas3.setFixedScrollToElement(null);
    // setTimeout(() => {
    //   Canvas3.setMeshPositionsUpdate(false);
    // }, 100);
  },
});

const scrollToFirstActiveSlide = (fixTargetIndex: number | null) => {
  if (fixTargetIndex) {
    const targetElPosition =
      slidesRefs.value[fixTargetIndex]?.getBoundingClientRect().top ?? 0;
    const position = window.scrollY + targetElPosition;
    Canvas3.scrollTo(position);
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};

const getFixTargetIndex = () => {
  let fixTargetIndex = null;
  for (let i = 0; i < slideActiveArray.value.length; i++) {
    if (slideActiveArray.value[i]) {
      fixTargetIndex = i;
      break;
    }
  }
  return fixTargetIndex;
};

const layoutChangeSwitch = async () => {
  if (layoutSwitchInProgress.value) return;

  layoutChangeTl.clear();
  gsap.to(".nav-icon-line", {
    x: layoutSmall.value ? 10 : 0, // from origin down /
    y: layoutSmall.value ? 0 : 0, //  / to origin, down
    width: 0,
    duration: layoutChangeDuration / 2,
    stagger: 0.05,
  });

  const fixTargetIndex = getFixTargetIndex();
  await scrollToFirstActiveSlide(fixTargetIndex);
  if (fixTargetIndex) {
    const fixTargetEl = slidesRefs.value[fixTargetIndex];
    if (fixTargetEl) {
      Canvas3.setFixedScrollToElement(fixTargetEl);
    }
  }

  layoutSwitchInProgress.value = true;
  layoutChangeUniform.value = 1;

  layoutSmall.value = !layoutSmall.value;
  const itemWidth = layoutSmall.value ? 25 : 33;

  // layoutChangeTl.clear();
  // layoutChangeTl.to(
  //   ".nav-icon-line",
  //   {
  //     x: layoutSmall.value ? 10 : 0, // from origin down /
  //     y: layoutSmall.value ? 0 : 0, //  / to origin, down
  //     width: 0,
  //     duration: layoutChangeDuration / 2 + 0.3,
  //     stagger: 0.05,
  //   },
  //   "<",
  // );
  layoutChangeTl.set(".nav-icon", {
    transform: `rotate(${layoutSmall.value ? 0 : 90}deg)`,
  });
  layoutChangeTl.set(".nav-icon-line", {
    x: layoutSmall.value ? 5 : 0, // from origin from right
    y: layoutSmall.value ? 0 : 0, //
  });
  layoutChangeTl.to(
    ".nav-icon-line",
    {
      width: "30px",
      x: 0,
      y: 0,
      duration: layoutChangeDuration / 2,
      stagger: 0.05,
    },
    "<",
  );

  for (let i = 0; i < slidesRefs.value.length; i++) {
    if (slidesRefs.value[i]) {
      const position = slidesRefs.value[i]?.dataset.itemPosition ?? 0;
      let marginLeft = layoutSmall.value ? 37.5 : Number(position) * 33;
      const text = slidesRefs.value[i]?.querySelector(".slide-text");
      let refItemWidth = itemWidth;
      if (text) {
        if (layoutSmall.value) {
          marginLeft = 0;
          refItemWidth = 100;
        }
        layoutChangeTl.to(
          text,
          {
            duration: layoutChangeDuration / 2,
            transform: "matrix(1,0,0.25,1.25,0,0)",
          },
          "0",
        );
        layoutChangeTl.to(
          text,
          {
            duration: layoutChangeDuration / 2,
            transform: "matrix(1,0,0,1,0,0)",
          },
          "<=" + layoutChangeDuration / 2,
        );
      }
      layoutChangeTl.to(
        slidesRefs.value[i] ?? null,
        {
          marginLeft: `${marginLeft}%`,
          width: `${refItemWidth}%`,
        },
        "0",
      );
    }
  }
};

useSeoMeta({
  title: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogTitle: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  description: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
  ogDescription: "Canvas3 - Playground - Tomas Kmet - Creative web developer",
});

onMounted(() => {
  setTimeout(() => {
    Canvas3.setScrollShaderByName("scrollPlayground");
  }, 0);
});
onBeforeUnmount(() => {
  Canvas3.setScrollShaderByName("scrollPlayground");
});

const slides = ref<
  {
    image?: string;
    text?: string;
    position: number;
    scrollSpeed?: number;
  }[]
>([
  {
    text: "Canvas3",
    position: 1,
    // scrollSpeed: 0.15,
  },
  {
    image: "/playground/images/01.webp",
    position: 0,
    // scrollSpeed: 0.3,
  },
  {
    image: "/playground/images/02.webp",
    position: 1,
    // scrollSpeed: 0.15,
  },
  {
    image: "/playground/images/03.webp",
    position: 2,
    // scrollSpeed: 0.3,
  },
  {
    text: "scroll",
    position: 0,
    scrollSpeed: 0.3,
  },
  {
    text: "performance",
    position: 1,
    scrollSpeed: 0.15,
  },
  {
    text: "playground",
    position: 2,
  },
  {
    image: "/playground/images/04.webp",
    position: 0,
    scrollSpeed: 0.3,
  },
  {
    image: "/playground/images/05.webp",
    position: 1,
    scrollSpeed: 0.15,
  },
  {
    image: "/playground/images/06.webp",
    position: 2,
    // scrollSpeed: 0.15,
  },
  {
    image: "/playground/images/07.webp",
    position: 1,
    scrollSpeed: -0.1,
  },
  {
    image: "/playground/images/08.webp",
    position: 0,
    scrollSpeed: -0.2,
  },
  {
    text: "dynamic",
    position: 0,
    scrollSpeed: 0.5,
  },
  {
    text: "scroll",
    position: 1,
    scrollSpeed: 0.25,
  },
  {
    text: "settings",
    position: 2,
    scrollSpeed: 0,
  },
  {
    image: "/playground/images/09.webp",
    position: 0,
    scrollSpeed: 0.5,
  },
  {
    image: "/playground/images/10.webp",
    position: 1,
    scrollSpeed: 0.25,
  },
  {
    image: "/playground/images/11.webp",
    position: 2,
  },
  {
    text: "full",
    position: 0,
  },
  {
    text: "scroll",
    position: 1,
    scrollSpeed: -0.15,
  },
  {
    text: "control",
    position: 2,
    scrollSpeed: -0.3,
  },
  {
    image: "/playground/images/12.webp",
    position: 1,
    scrollSpeed: 0.3,
  },
  {
    image: "/playground/images/13.webp",
    position: 2,
    scrollSpeed: -0.2,
  },
  {
    image: "/playground/images/14.webp",
    position: 0,
    scrollSpeed: -0.4,
  },
  {
    text: "smooth",
    position: 0,
    scrollSpeed: 0.5,
  },
  {
    text: "performance",
    position: 1,
    scrollSpeed: 0.2,
  },
  {
    image: "/playground/images/15.webp",
    position: 2,
    // scrollSpeed: -0.15,
  },
  {
    image: "/playground/images/16.webp",
    position: 1,
  },
  {
    image: "/playground/images/17.webp",
    position: 0,
    // scrollSpeed: -0.35,
  },
  {
    image: "/playground/images/18.webp",
    position: 1,
    scrollSpeed: -0.2,
  },
  {
    image: "/playground/images/19.webp",
    position: 2,
    scrollSpeed: -0.4,
  },
]);
</script>
<style lang="scss" scoped>
.page-container {
  //background: black;
}

.layout-nav-container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

.scroll-speed-ani {
  position: absolute;
  height: 15px;
  top: 0px;
  left: 0;
  background: var(--light-color);
  z-index: 1;
}

.scroll-speed-text {
  font-size: 12px;
  z-index: 2;
  position: absolute;
  left: 0px;
  display: block;
  color: var(--dark-color);
}

.nav-holder {
  font-weight: 800;
  font-size: 20px;
  position: absolute;
  right: 15px;
  top: 15px;
  pointer-events: auto;
  cursor: pointer;
}

.nav-icon {
  width: 30px;
  transform: rotate(90deg);
  transform-origin: center;
}

.nav-icon-line {
  position: relative;
  display: block;
  width: 30px;
  height: 3px;
  margin: 5px 0;
  background-color: var(--light-color);
}

.sections-container {
  padding-bottom: 350px;
}

.slide {
  padding: 10px;
  width: 33%;
  position: relative;

  img {
    width: 100%;
  }

  .slide-text {
    text-align: center;
    text-transform: uppercase;
    font-family: "PP Formula Black", serif;
    font-size: 85px;
    font-weight: 400;
    margin: 10px 0;
    opacity: 0;
    overflow: hidden;
    position: relative;
    line-height: 90px;
    @include respond-width($w-m) {
      font-size: 75px;
      line-height: 80px;
    }
  }
}
</style>
