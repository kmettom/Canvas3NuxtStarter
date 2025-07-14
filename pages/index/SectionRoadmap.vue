<template>
  <div class="roadmap-section-bg">
    <Container id="" additional-class="roadmap-section">
      <h2 class="body-s about-headline">Road map</h2>
      <div class="body-l">
        <p
          v-onScrollActivate="{
            activeRange: 0.85,
            activateOnce: true,
            activateCallback: textAniCallback,
          }"
          class="roadmap-txt"
        >
          → Canvas3Text component dynamic colors<br />
          → 3D model imports<br />
          → Canvas initiation improvements<br />
          <!--          → Responsiveness management - improve Display store<br />-->
          → Enable/Disable canvas animations dynamically<br />
          <!--          → Side scroll sections<br />-->
          → Create Type for working with TypeScript<br />
          → Create SDK for generic usage<br />
          → Refactor to Typescript <br />
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
  const selector = item.elNode;
  const tl = gsap.timeline();
  const lines = new SplitText(selector, {
    type: "lines",
  }).lines;
  const wrappedLines = new SplitText(lines, { type: "lines" }).lines;
  tl.set(wrappedLines, { opacity: 0, y: 50 });
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
.about-headline {
  margin-left: 20px;
  font-weight: lighter;
}
.roadmap-section {
  display: grid;
  grid-template-columns: 6fr 14fr;
  text-transform: uppercase;
  padding-bottom: 125px;
  padding-top: 10vh;
  @include respond-width($w-xs) {
    grid-template-columns: 1fr;
    padding: 10vh 10px 125px 10px;
  }
}
.roadmap-txt {
  line-height: 1.5;
  opacity: 0;
  @include respond-width($w-m) {
    margin-bottom: 10px;
  }
  @include respond-width($w-xs) {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  div {
    opacity: 0;
    * {
      opacity: 0;
    }
  }
}
</style>
