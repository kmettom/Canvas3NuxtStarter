<template>
  <div class="">
    <Container>
      <h2 class="heading-1 text-align-right">
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
            <h3 class="body-l">Easily add images to scene</h3>
            <!--            <p class="example-txt">-->
            <!--              Use CanvasImage component to add images to three.js scene as mesh,-->
            <!--              specify which predefined shader you want to use and add a trigger-->
            <!--              variable.-->
            <!--            </p>-->
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
              Add needed uniforms for shaders (hover: {{ example1Hover }})
            </h3>
            <!--            <p class="example-txt">-->
            <!--              add uniforms - uniforms are reactive, manipulate uniforms with-->
            <!--              your business-->
            <!--            </p>-->
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
              activeRange: 0.7,
              activateOnce: false,
              bidirectionalActivation: true,
            }"
            class="example-1 example-wrapper"
            @mouseenter="example2Hover = true"
            @mouseleave="example2Hover = false"
          >
            <div class="code-example-wrapper">
              <p class="example-txt"></p>
              <CanvasImage
                :src-link="'images/03.JPG'"
                :uniforms="{
                  uHover: { value: example2Hover ? 1 : 0, duration: 0.55 },
                }"
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
              activeRange: 0.9,
              activateOnce: false,
              scrollSpeedSetTo: { value: 0.2 },
            }"
            class="example-4 example-wrapper"
            @mouseenter="example2Hover = true"
            @mouseleave="example2Hover = false"
          >
            <!--            <h3 class="body-l">Advanced settings</h3>-->
            <p class="example-txt">Set Scroll speed of elements</p>
            <CanvasImage
              :src-link="'images/04.JPG'"
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
          <div
            id="fixedParent"
            class="fixed-scroll-example example-wrapper"
            v-onScrollActivate="{
              activeRange: 0.9,
              fixToParentId: 'fixedParent',
            }"
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

const example1Hover = ref(false);
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
}
.fixed-scroll-example {
  border: 1px solid var(--light-color);
  height: 1000px;
}
</style>
