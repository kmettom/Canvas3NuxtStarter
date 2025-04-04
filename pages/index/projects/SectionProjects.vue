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
          <div>Example 1</div>
          <CanvasImage
            :src-link="'images/01.JPG'"
            :uniforms="{
              uHover: { active: false, duration: 0.55 },
              uImageGallery: { active: false, duration: 0.5 },
              uImageGalleryActive: { active: false, duration: 0.5 },
            }"
            :load-strategy="'eager'"
            alt=""
          />
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";
</script>

<style lang="scss" scoped></style>
