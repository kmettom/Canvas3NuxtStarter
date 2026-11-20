<template>
  <div class="">
    <Container>
      <h2 class="heading-2">
        <!--        v-canvas3-scroll-action="{ activeRange: 0.9, activateOnce: true }"-->
        <span> EXAMPLES </span>
      </h2>
      <div>
        <div class="examples-row">
          <div class="example-wrapper">
            <h3 class="body-l heading-example">Add images to scene 😌</h3>
            <img
              v-canvas3-image="{
                shaderName: 'example1',
              }"
              :src="'/images/new/02.webp'"
              alt="building"
            />
            <CodeSnippet :code="codeExample1" />
          </div>

          <div
            class="example-wrapper"
            @mouseenter="example1Hover = true"
            @mouseleave="example1Hover = false"
          >
            <h3 class="body-l heading-example">
              Add shader uniforms
              <span class="">(hover: {{ example1Hover ? "👍" : "👎" }})</span>
            </h3>
            <img
              v-canvas3-image="{
                uniforms: ex2ImageUniforms,
                shaderName: 'example0',
              }"
              :src="'/images/new/04.webp'"
              alt="building"
            />
            <CodeSnippet :code="codeExample2" />
          </div>
        </div>
        <div class="example-row-second">
          <h3 class="body-l heading-example">
            Directive for scroll manipulation and feedback
          </h3>
          <p class="example-txt">
            Use directive for scroll manipulation and feedback. All Canvas3Image
            or Canvas3Text get activated automatically by uAniIn uniform float
            variable
          </p>
          <div class="examples-row">
            <div
              v-canvas3-scroll-action="example3ScrollOptions"
              class="example-wrapper sm"
            >
              <div class="code-example-wrapper">
                <p class="example-txt">
                  Scroll speed: {{ example3Speed.toFixed(2) }}
                  <span ref="scrollSpeedAniEl" class="scroll-speed-ani" />
                </p>
                <img
                  v-canvas3-image="{
                    uniforms: {
                      uTransition: {
                        value: example3Speed,
                        duration: 0,
                        ease: 'linear',
                      },
                      uTextureMaskNoise: {
                        value: animationAssets.getTextureMaskNoise(),
                      },
                      uTexturePrevious: {
                        value: animationAssets.getTextureDefaultImage(),
                      },
                    },
                    shaderName: 'example0',
                  }"
                  :src="'/images/new/05.webp'"
                  alt="sky"
                />
                <CodeSnippet :code="codeExample3" />
              </div>
            </div>
            <div
              v-canvas3-scroll-action="example4OuterOptions"
              class="example-4 example-wrapper sm"
            >
              <!--              xxx1-->
              <div v-canvas3-scroll-action="example4InnerOptions">
                <p class="example-txt">
                  Set Scroll speed of elements
                  <span ref="exampleActivateTxtEl" class="example-activate-txt"
                    >Activated 👋</span
                  >
                </p>
                <img
                  v-canvas3-image="{
                    shaderName: 'example0',
                    uniforms: {
                      uTransition: {
                        duration: 0.35,
                        value: uAniInExample4Value,
                        ease: 'linear',
                      },
                      uTextureMaskNoise: {
                        value: animationAssets.getTextureMaskNoise(),
                      },
                      uTexturePrevious: {
                        value: animationAssets.getTextureDefaultBlack(),
                      },
                    },
                  }"
                  :src="'/images/new/06.webp'"
                  alt="sky"
                />
              </div>
              <CodeSnippet :code="codeExample4" />
            </div>
            <div
              id="fixedParent"
              v-canvas3-scroll-action="{
                activeRange: 0.9,
                fixToParent: {
                  containerId: 'fixedParent',
                  fixPosition: 0,
                  margin: 0,
                },
              }"
              class="fixed-scroll-example example-wrapper sm"
            >
              <div>
                <p class="example-txt">Fix element to Parent</p>
                <img
                  v-canvas3-image="{
                    uniforms: {
                      uHover: {
                        value: example2Hover ? 1 : 0,
                        duration: 0.55,
                        ease: 'linear',
                      },
                    },
                    shaderName: 'example1',
                  }"
                  :src="'/images/new/07.webp'"
                  alt="building"
                />
                <CodeSnippet :code="codeExample5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
import CodeSnippet from "~/components/common/CodeSnippet.vue";
import gsap from "gsap";
import type { ScrollActionBinding } from "@canvas3/nuxt";
import { useAnimationAssets } from "~/stores/animationAssets";

const example1Hover = ref(false);
const example3Speed = ref(0);
const uAniInExample4Value = ref(0);
const example2Hover = ref(false);
const scrollSpeedAniEl = ref<HTMLElement | null>(null);
const exampleActivateTxtEl = ref<HTMLElement | null>(null);

const onExample3Scroll = (item: ScrollActionBinding, speed: number) => {
  example3Speed.value = speed;
  gsap.to(scrollSpeedAniEl.value, {
    width: `${speed * 100}%`,
    duration: 0.1,
  });
};

const animationAssets = useAnimationAssets();

const codeExample1 = `
  <img
    v-canvas3-image="{
      shaderName: 'example1',
    }"
    :src="'images/01.webp'"
  />
`;

const codeExample2 = `
  <img
    v-canvas3-image="{
      uniforms: uniforms,
      shaderName: 'example0',
    }"
    :src="'images/01.webp'"
  />
`;

const codeExample3 = `
  v-canvas3-scroll-action="{
    activeRange: 0.9,
    onScrollCallback: (item, speed) => {
      // do something on scroll
    },
  }"
`;

const codeExample4 = `
  v-canvas3-scroll-action="{
    activeRange: 0.7,
    scrollSpeedSetTo: { value: 0.3 },
    bidirectionalActivation: true,
    activateCallback: (item, speed) => {
      // do something when activated
    },
  }"
`;

const codeExample5 = `
  v-canvas3-scroll-action="{
    activeRange: 0.9,
    fixToParent: {
      containerId: 'fixedParent',
      fixPosition: 0,
      margin: 0,
    },
  }"
`;

const ex2ImageUniforms = computed(() => {
  return {
    uTransition: {
      value: example1Hover.value ? 1 : 0,
      duration: 0.3,
      ease: "linear",
    },
    uTextureMaskNoise: { value: animationAssets.getTextureMaskNoise() },
    uTexturePrevious: { value: animationAssets.getTextureDefaultImage() },
  };
});

const example3ScrollOptions = computed(() => ({
  activeRange: 0.9,
  onScrollCallback: onExample3Scroll,
}));

const example4OuterOptions = {
  activeRange: 1,
  scrollSpeedSetTo: { value: 0.3, duration: 0 },
};

const example4InnerOptions = {
  activeRange: 0.7,
  activateCallback: () => {
    const tl = gsap.timeline();
    tl.to(exampleActivateTxtEl.value, { x: -10, opacity: 1, duration: 0.5 });
    tl.to(exampleActivateTxtEl.value, { x: 0, opacity: 0, duration: 0.5 });
    uAniInExample4Value.value = 1;
  },
  deactivateCallback: () => {
    uAniInExample4Value.value = 0;
  },
};
</script>

<style lang="scss" scoped>
.heading-2 {
  padding-top: 50px;
  padding-bottom: 20px;
}

.heading-example {
  padding-bottom: 10px;
}

.examples-row {
  display: flex;
  padding: 20px 0;
}

.example-row-second {
  padding-top: 75px;
}

.example-wrapper {
  width: 50%;
  padding: 0 15px;
  @include respond-width($w-m-s) {
    padding: 0 5px;
  }
  &.sm {
    width: 32%;
  }
  img {
    max-width: 100%;
  }
}

.example-txt {
  padding: 10px 0;
  position: relative;
}

.fixed-scroll-example {
  margin-right: 10px;
  border-right: 1px solid var(--light-color);
  height: 1000px;
  margin-bottom: 100px;
}

.scroll-speed-ani {
  position: absolute;
  bottom: 2px;
  left: 0;
  border-bottom: 5px solid var(--light-color);
}

.example-activate-txt {
  //color: var(--light-color);
  opacity: 0;
  position: absolute;
  font-weight: bold;
  bottom: 10px;
  right: 0;
}
</style>
