<template>
  <div ref="gameContainer" class="contact-section">
    <Container>
      <div class="">
        <div class="contact-line">
          <div class="heading-1">
            <span
              v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
            >
              <CanvasText :theme="'dark'"> GET </CanvasText>
              <span
                v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
                class="canvas-text-spacing"
              >
                <CanvasText :theme="'dark'"> IN </CanvasText>
              </span>
            </span>
          </div>
          <div
            v-onScrollActivate="{
              activeRange: 0.85,
              activateOnce: true,
              activateCallback: (item) => {
                splitLineAnimation(item.elNode);
              },
            }"
            class="side-list action-list body-m"
          >
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📞',
                }"
                href="https://calendly.com/tomaskmet/meeting"
                target="_blank"
              >
                <span>📞 Book a call</span>
              </a>
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📮',
                }"
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
            v-onScrollActivate="{
              activeRange: 0.85,
              activateOnce: true,
              activateCallback: (item) => {
                splitLineAnimation(item.elNode);
              },
            }"
            class="side-list social-media-list body-m"
          >
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📷',
                }"
                href="https://www.instagram.com/kmettom"
                target="_blank"
                >Instagram</a
              >
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '𝕏',
                }"
                href="https://x.com/KmetTom"
                target="_blank"
                >X (Twitter)</a
              >
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '👀',
                }"
                href="https://www.linkedin.com/in/tomas-kmet/"
                target="_blank"
                >LinkedIn</a
              >
            </div>
            <div>
              <a
                v-set-data-attrs="{
                  cursoropacity: 0.7,
                  cursorsize: 70,
                  cursoricon: '📮',
                }"
                href="mailto:hello@tomaskmet.com"
                data-email="hello@tomaskmet.com"
                >Email</a
              >
            </div>
          </div>
          <div class="heading-1">
            <span
              v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
            >
              <CanvasText :theme="'dark'"> TOUCH </CanvasText>
            </span>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const splitLineAnimation = (item) => {
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
  color: var(--dark-color);
  background-color: var(--light-color);
  padding: 17vh 0 7vh;
  @include respond-width($w-xs) {
    padding: 20vh 0 12vh;
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
  justify-content: start;
  padding-left: 20px;
  @include respond-width($w-m-s) {
    justify-content: center;
  }
  @include respond-width($w-xs) {
    padding-left: 0;
  }
  &.align-right {
    padding-right: 20px;
    justify-content: end;
    @include respond-width($w-m-s) {
      justify-content: center;
    }
    @include respond-width($w-xs) {
      padding-right: 0;
    }
  }
}

.side-list {
  display: flex;
  flex-direction: column;
  justify-content: end;
  position: relative;
  bottom: 75px;
  gap: 5px;

  @include respond-width($w-m-s) {
    bottom: 50px;
  }
  @include respond-width($w-xs) {
    bottom: 0;
    display: block;
    padding: 0 10px;
  }
  &.social-media-list div {
    text-align: right;
  }
  a {
    cursor: none;
  }
}

.basketball-game {
  width: 100%;
  height: 25px;
  position: absolute;
  bottom: 0;
  left: 0;
  @include respond-width($w-m-s) {
    display: none;
  }
}

.game-pad {
  width: 150px;
  height: 25px;
  background-color: var(--dark-color);
  position: absolute;
  left: 0;
  bottom: 0;
}

.game-points {
  text-align: center;
  opacity: 0;
  bottom: 35px;
  left: 0;
  right: 0;
  margin: 0 auto;
  position: absolute;
  pointer-events: none;
  font-size: 25px;
  font-weight: bold;
}

.basketball-icon-wrapper {
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  @include respond-width($w-m-s) {
    display: none;
  }
}
</style>
