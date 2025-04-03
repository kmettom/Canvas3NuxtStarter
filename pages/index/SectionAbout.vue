<template>
  <Container id="about" additional-class="about-section">
    <h2 class="body-xs">About</h2>
    <div class="body-l">
      <p
        v-onScrollActivate="{
          activeRange: 0.85,
          activateOnce: true,
          activateCallback: textAniCallback,
        }"
        class="about-1 about-txt"
        data-about-id="about-1"
      >
        Nuxt starter pack with integrated three.js canvas.
      </p>
      <p
        v-onScrollActivate="{
          activeRange: 0.85,
          activateOnce: true,
          activateCallback: textAniCallback,
        }"
        class="about-2 about-txt"
        data-about-id="about-2"
      >
        Directive to adjust scroll speed of an element, activate animation on scroll, set as fixed element and much more. Also includes a Image component which automatically loads the image as mesh and Text component for MSDF font rendering.
      </p>
    </div>
  </Container>
</template>

<script setup>
import Container from "~/components/common/Container.vue";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

function textAniCallback(item) {
  const selector = `.${item.elNode.dataset.aboutId}`;
  const tl = gsap.timeline();
  const lines = new SplitText(selector, {
    type: "lines",
  }).lines;
  const wrappedLines = new SplitText(lines, { type: "lines" }).lines;
  tl.set(selector, { opacity: 1, overflow: "hidden" });
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
  }
}
</style>
