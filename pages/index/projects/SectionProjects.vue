<template>
  <div class="works-section">
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
          <div v-onScrollActivate="{ activeRange: 0.9 }">
            <h3 class="body-l">Example 1 - Animate item in</h3>
            <p class="body-xs">
              All CanvasImage or CanvasText get activated automatically
            </p>
            <CanvasImage
              :src-link="'images/01.JPG'"
              :uniforms="{
                uHover: { value: 0, duration: 0.55 },
              }"
              :load-strategy="'eager'"
              alt=""
            />
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";

const example1Uni = computed(() => {});
</script>

<style lang="scss" scoped></style>
