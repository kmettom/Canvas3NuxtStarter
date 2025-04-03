<template>
  <div class="roadmap-section-bg">
    <Container id="" additional-class="roadmap-section">
      <h2 class="body-xs">Road map</h2>
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
          3D model imports and interactions
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
          SDK extraction
        </p>
      </div>
    </Container>
  </div>
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
.roadmap-section-bg {
  background: var(--light-color);
  color: var(--dark-color);
}
.roadmap-section {
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
