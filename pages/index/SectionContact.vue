<template>
  <div ref="gameContainer" class="contact-section">
    <Container>
      <div class="">
        <div class="contact-line">
          <div class="heading-1">
            <span
              v-action-on-scroll="{ activeRange: 0.99, activateOnce: true }"
            >
              <!--              <Canvas3Text :theme="'light'"> GET </Canvas3Text>-->
              GET
              <span
                v-action-on-scroll="{ activeRange: 0.99, activateOnce: true }"
                class="canvas-text-spacing"
              >
                <!--                <Canvas3Text :theme="'light'"> IN </Canvas3Text>-->
                IN
              </span>
            </span>
          </div>
          <div
            v-action-on-scroll="{
              activeRange: 0.85,
              activateOnce: true,
              activateCallback: (item: ScrollActionBinding) => {
                splitLineAnimation(item.elNode);
              },
            }"
            class="side-list action-list body-m"
          >
            <div>
              <a href="https://calendly.com/tomaskmet/meeting" target="_blank">
                <span>📞 Book a call</span>
              </a>
            </div>
            <div>
              <a
                href="mailto:hello@tomaskmet.com"
                data-email="hello@tomaskmet.com"
              >
                <span>✉️ Send a request</span>
              </a>
            </div>
          </div>
        </div>
        <div class="contact-line align-right">
          <div
            v-action-on-scroll="{
              activeRange: 0.85,
              activateOnce: true,
              activateCallback: (item: ScrollActionBinding) => {
                splitLineAnimation(item.elNode);
              },
            }"
            class="side-list social-media-list body-m"
          >
            <div>
              <a href="https://www.instagram.com/kmettom" target="_blank"
                >Instagram</a
              >
            </div>
            <div>
              <a href="https://x.com/KmetTom" target="_blank">X (Twitter)</a>
            </div>
            <div>
              <a href="https://www.linkedin.com/in/tomas-kmet/" target="_blank"
                >LinkedIn</a
              >
            </div>
            <div>
              <a
                href="mailto:hello@tomaskmet.com"
                data-email="hello@tomaskmet.com"
                >Email</a
              >
            </div>
          </div>
          <div class="heading-1">
            <span
              v-action-on-scroll="{ activeRange: 0.99, activateOnce: true }"
            >
              <!--              <Canvas3Text :theme="'light'"> TOUCH </Canvas3Text>-->
              TOUCH
            </span>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

//TODO: proper type import export
import type { ScrollActionBinding } from "../../../canvas3-nuxt/dist/runtime/types/types";

gsap.registerPlugin(SplitText);

const splitLineAnimation = (item: HTMLElement) => {
  const tl = gsap.timeline({ delay: 0.5 });
  const lines = new SplitText(item, {
    type: "lines",
  }).lines;
  tl.set(item, { opacity: 1 });
  tl.fromTo(
    lines,
    { y: "10px", opacity: 0 },
    {
      duration: 0.3,
      opacity: 1,
      y: "0px",
      stagger: 0.1,
    },
  );
};
</script>

<style lang="scss" scoped>
.contact-section {
  position: relative;
  color: var(--light-color);
  //background-color: var(--light-color);
  padding: 30vh 0 7vh;
  @include respond-width($w-xs) {
    padding: 35vh 0 12vh;
  }
}
.canvas-text-spacing {
  padding-left: 20px;
  position: relative;
  display: inline-block;
}

.heading-1 {
  @include respond-width($w-xs) {
    font-size: 100px;
  }
}

.contact-line {
  display: flex;
  justify-content: center;
  padding-left: 20px;
  @include respond-width($w-xs) {
    padding-left: 0;
  }
}

.side-list {
  display: flex;
  flex-direction: column;
  justify-content: end;
  position: relative;
  bottom: 45px;
  gap: 5px;
  @include respond-width($w-m-s) {
    bottom: 40px;
  }
  @include respond-width($w-xs) {
    bottom: 0;
    display: block;
    padding: 0;
  }
  &.social-media-list div {
    text-align: right;
  }
  a {
    color: var(--light-color);
    text-decoration: none;
  }
}
</style>
