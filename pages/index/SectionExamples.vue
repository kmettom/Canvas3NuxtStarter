<template>
  <div class="">
    <Container>
      <h2 class="heading-1 text-align-right">
        <span
          v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
          v-set-data-attrs="{ cursorcolor: 'light' }"
        >
          <CanvasText :theme="'light'"> EXAMPLES </CanvasText>
        </span>
      </h2>
      <div>
        <div>
          <p>
            - activate item - scroll speed - origin of active - callback -
            scroll call back for rotation - Image component - Text component
            <br />
            <br />
            <br />
          </p>
          <div
            v-onScrollActivate="{ activeRange: 0.9 }"
            class="example-1"
            @mouseenter="example1Hover = true"
            @mouseleave="example1Hover = false"
          >
            <h3 class="body-l">Basic</h3>
            <!--            <p class="body-xs">-->
            <!--              All CanvasImage or CanvasText get activated automatically-->
            <!--            </p>-->
            <div class="code-example-wrapper">
              <CanvasImage
                :src-link="'images/01.JPG'"
                :uniforms="{
                  uHover: { value: example1Hover ? 1 : 0, duration: 0.55 },
                }"
                :load-strategy="'eager'"
                alt=""
              />
              <div class="code-container">
                <pre>
                  <code>
                  {
                    activeRange: 0.99,
                    activateOnce: true
                  }
                  </code>
                </pre>
              </div>
            </div>
          </div>
          <div
            v-onScrollActivate="{ activeRange: 0.9 }"
            class="example-2"
            @mouseenter="example1Hover = true"
            @mouseleave="example1Hover = false"
          >
            <h3 class="body-l">Scroll speed</h3>
            <!--            <p class="body-xs">-->
            <!--              All CanvasImage or CanvasText get activated automatically-->
            <!--            </p>-->
            <div class="code-example-wrapper">
              <CanvasImage
                :src-link="'images/01.JPG'"
                :uniforms="{
                  uHover: { value: example1Hover ? 1 : 0, duration: 0.55 },
                }"
                :load-strategy="'eager'"
                alt=""
              />
              <div class="code-container">
                <pre>
                  <code>
                  {
                    activeRange: 0.99,
                    activateOnce: true
                  }
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";

const example1Hover = ref(false);
</script>

<style lang="scss" scoped>
.code-example-wrapper {
  display: flex;
}
.code-container {
  background: black;
}
</style>
