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
        A developer with managerial background and 10+ years of hands on coding
        experience.
        <br />
        WORKING WITH AGENCIES, COMPANIES and freelancers using broad spectrum
        frameworks and backend API's.
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
        Interested in developing web apps, dapps, websites and e-commerce,
        happily spending time with Web3 or animating with WebGl. Looking forward
        to learning more. Connected with a broad network to fit the needs of a
        wide range of projects.
        <br />
        Collaborate with other developers, designers and marketers to shape and
        create brands, experiences and products together.
      </p>

      <!--        <DownloadButton />-->
    </div>
  </Container>
</template>

<script setup>
import Container from '~/components/common/Container.vue';

import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

function textAniCallback(item) {
  const selector = `.${item.elNode.dataset.aboutId}`;
  const tl = gsap.timeline();
  const lines = new SplitText(selector, {
    type: 'lines',
  }).lines;
  const wrappedLines = new SplitText(lines, { type: 'lines' }).lines;
  tl.set(selector, { opacity: 1, overflow: 'hidden' });
  tl.set(lines, { opacity: 1, overflow: 'hidden' });
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
