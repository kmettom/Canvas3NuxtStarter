<template>
  <div class="">
    <Container>
      <h2 class="heading-1">
        <span
          v-onScrollActivate="{ activeRange: 0.9, activateOnce: true }"
          v-set-data-attrs="{ cursorcolor: 'light' }"
        >
          <CanvasText :theme="'light'"> EXAMPLES </CanvasText>
        </span>
      </h2>
      <div>
        <div class="examples-row">
          <div class="example-wrapper">
            <h3 class="body-l">Add images to scene</h3>
            <CanvasImage :src-link="'images/01.JPG'" :shader="'example1'" />
            <CodeSnippet>
              <span> {{ String("<") }}</span
              >CanvasImage :src-link="'images/01.JPG'" :shader="'example1'" />
            </CodeSnippet>
          </div>

          <div
            class="example-wrapper"
            @mouseenter="example1Hover = true"
            @mouseleave="example1Hover = false"
          >
            <h3 class="body-l">
              Add shader uniforms ( hover: {{ example1Hover }} )
            </h3>
            <CanvasImage
              :src-link="'images/02.JPG'"
              :shader="'example2'"
              :uniforms="{
                uHover: { value: example1Hover ? 1 : 0, duration: 1 },
              }"
            />
            <CodeSnippet>
              <span> {{ String("<") }}</span
              >CanvasImage :src-link="'images/02.JPG'" :shader="'example2'"
              :load-strategy="'eager'" :uniforms="{ uHover: { value:
              example1Hover ? 1 : 0, duration: 1 } }"/>
            </CodeSnippet>
          </div>
        </div>
        <h3 class="body-l">Directive for scroll manipulation and feedback</h3>
        <p class="example-txt">
          Use directive for scroll manipulation and feedback. All CanvasImage or
          CanvasText get activated automatically by uAniIn uniform float
          variable
        </p>
        <div class="examples-row">
          <div
            v-onScrollActivate="{
              activeRange: 0.9,
              activateOnce: false,
              bidirectionalActivation: true,
              onScrollCallback: (item, speed) => {
                example3Speed = speed;
                gsap.to(item.elNode.querySelector('.scroll-speed-ani'), {
                  width: `${speed * 100}%`,
                  duration: 0.1,
                });
                example3Bounds = item.elNode.getBoundingClientRect().top;
              },
              activateCallback: (item) => {
                console.log('item', item);
                // gsap.fromTo(
                //   item.elNode.querySelector('.example-txt'),
                //   { opacity: 0 },
                //   { opacity: 1 },
                // );
              },
            }"
            class="example-wrapper"
          >
            <div class="code-example-wrapper">
              <p class="example-txt">
                Element top: {{ example3Bounds }}px <br />
                Scroll speed: {{ example3Speed }}
                <span class="scroll-speed-ani" />
              </p>
              <CanvasImage
                :src-link="'images/03.JPG'"
                :uniforms="{
                  uScrollSpeed: { value: example3Speed, duration: 0 },
                }"
                :shader="'example3'"
                :load-strategy="'eager'"
                alt=""
              />
              <CodeSnippet>
                v-onScrollActivate="{ activeRange: 0.8 }"
              </CodeSnippet>
            </div>
          </div>
          <div
            v-onScrollActivate="{
              activeRange: 0.7,
              activateOnce: false,
              scrollSpeedSetTo: { value: 0.3 },
            }"
            class="example-4 example-wrapper"
          >
            <p class="example-txt">Set Scroll speed of elements</p>
            <CanvasImage
              :src-link="'images/04.JPG'"
              :load-strategy="'eager'"
              alt=""
            />
            <CodeSnippet>
              { activeRange: 0.99, activateOnce: true }
            </CodeSnippet>
          </div>
          <div
            id="fixedParent"
            v-onScrollActivate="{
              activeRange: 0.9,
              fixToParentId: 'fixedParent',
            }"
            class="fixed-scroll-example example-wrapper"
          >
            <div>
              <p class="example-txt">Set fixed element</p>
              <CanvasImage
                :src-link="'images/01.JPG'"
                :uniforms="{
                  uHover: { value: example2Hover ? 1 : 0, duration: 0.55 },
                }"
                :load-strategy="'eager'"
                alt=""
              />
              <CodeSnippet>
                { activeRange: 0.99, activateOnce: true }
              </CodeSnippet>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";
import CodeSnippet from "~/components/common/CodeSnippet.vue";
import { gsap } from "gsap";

const example1Hover = ref(false);
const example3Speed = ref(0);
const example3Bounds = ref(0);
const example2Hover = ref(false);
</script>

<style lang="scss" scoped>
.examples-row {
  display: flex;
  padding: 20px 0;
}
.example-wrapper {
  width: 50%;
  padding: 0 15px;
}
.example-txt {
  padding: 10px 0;
  position: relative;
}
.fixed-scroll-example {
  border-right: 1px solid var(--light-color);
  height: 1000px;
}
.scroll-speed-ani {
  position: absolute;
  bottom: 2px;
  left: 0;
  border-bottom: 3px solid var(--light-color);
}
</style>
