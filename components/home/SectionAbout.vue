<template>
  <Container id="about" additional-class="about-section">
    <h2 class="body-s about-headline">About</h2>
    <div class="">
      <div
        v-canvas3-scroll-action="{
          activeRange: 0.85,
          activateOnce: true,
          activateCallback: textAniCallback,
        }"
        class="about-txt body-l"
      >
        Canvas3 is a Nuxt module, allowing for easy integration of threejs,
        smoothscroll and scroll control.
      </div>
      <h3
        v-canvas3-scroll-action="{
          activeRange: 0.85,
          activateOnce: true,
          activateCallback: textAniCallback,
        }"
        class="about-txt features-headline body-l"
      >
        Features:
      </h3>
      <div
        v-canvas3-scroll-action="{
          activeRange: 0.85,
          activateOnce: true,
          activateCallback: textAniCallback,
        }"
        class="about-txt body-m"
      >
        <ul>
          <li>
            Layout component initializing Canvas3 with smooth scroll and ThreeJS
            scene initialization
          </li>
          <li>Single RequestAnimationFrame loop for performance</li>
          <li>
            On scroll directive for scroll interactions, scroll speed change and
            set element to active state
          </li>
          <li>
            Image into ThreeJS mesh directive for easy imports of images to the
            scene with scroll control and option to define uniforms
          </li>
          <li>
            Canvas3 function exports for full control of ThreeJS scene and
            scroll
          </li>
          <li>
            MSDF font render with directive with simple shader and uniform
            control
          </li>
          <li>GLTF 3d model import and position control on scroll</li>
        </ul>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import type { ScrollActionBinding } from "@canvas3/nuxt";

gsap.registerPlugin(SplitText);

function textAniCallback(itemEl: ScrollActionBinding) {
  const parent = itemEl.elNode;
  if (!parent) return;
  const tl = gsap.timeline();
  const lines = new SplitText(parent, {
    type: "lines",
    aria: "none",
  }).lines;
  const wrappedLines = new SplitText(lines, { type: "lines", aria: "none" })
    .lines;
  tl.set(wrappedLines, { opacity: 0, y: 50 });
  tl.set(parent, { opacity: 1, overflow: "hidden" });
  tl.set(lines, { opacity: 1, overflow: "hidden" });
  tl.fromTo(
    wrappedLines,
    { y: 50, opacity: 1 },
    {
      duration: 0.3,
      opacity: 1,
      y: 0,
      stagger: 0.1,
    },
  );
}
</script>

<style lang="scss" scoped>
.about-section {
  display: grid;
  grid-template-columns: 10fr 14fr;
  text-transform: uppercase;
  padding-bottom: 125px;
  padding-top: 10vh;
  @include respond-width($w-xs) {
    grid-template-columns: 1fr;
    padding: 10vh 10px 125px 10px;
  }
}
.about-headline {
  margin-left: 20px;
  font-weight: lighter;
}
.about-txt {
  opacity: 0;
  @include respond-width($w-m) {
    margin-bottom: 10px;
  }
  @include respond-width($w-xs) {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  &.about-1 {
    margin-bottom: 30px;
  }
  div {
    opacity: 0;
    overflow: hidden;
  }
}
.features-headline {
  padding-top: 25vh;
  padding-bottom: 20px;
}
</style>
