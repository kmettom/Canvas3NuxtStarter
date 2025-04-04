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
        <div
          class="project-item"
          @mouseover="hoverProject(true)"
          @mouseleave="hoverProject(false)"
        >
          <CanvasImage
            :src-link="project.src"
            :uniforms="projectImageUniforms"
            :load-strategy="'eager'"
            alt=""
          />
          <!--          <Project-->
          <!--            :project="project"-->
          <!--            :index="index"-->
          <!--            @open-gallery="openProject(index)"-->
          <!--          />-->
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from "~/components/common/Container.vue";
import Project from "~/pages/index/projects/Project.vue";

const navigationStore = useNavigationStore();

const openProject = (index) => {
  navigationStore.openGalleryProject(index);
};
</script>

<style lang="scss" scoped>
$marginRight: 50px;

.works-section {
  padding-top: 10vh;
  padding-bottom: 20vh;
  margin: 10vh $marginRight auto 100px;
  position: relative;

  @include respond-width($w-s) {
    margin: auto $marginRight auto 50px;
  }
  @include respond-width($w-xs) {
    margin: auto 25px auto 25px;
  }
  @include respond-width($w-xxs) {
    margin: auto 10px auto 10px;
  }
}

#gallery {
  position: relative;
}

.gallery-controls {
  opacity: 0;
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
  @include respond-width($w-xs) {
    width: 100%;
  }
  &.active {
    pointer-events: auto;
  }
}

.gallery-controls-btn {
  position: absolute;
  background: none;
  outline: none;
  border: none;
  cursor: none;
  @include respond-width($w-xs) {
    background: rgba(
      0,
      0,
      0,
      0.5
    ); /* Transparent white background with 10% opacity */
    backdrop-filter: blur(10px); /* Applies the blur effect */
    -webkit-backdrop-filter: blur(10px); /* Ensures compatibility with Safari */
    font-size: 12px;
  }
}

.close-btn {
  width: 35px;
  height: 35px;
  background: none;
  outline: none;
  border: none;
  top: 115px;
  right: -35px;
  z-index: 10;
  @include respond-width($w-xs) {
    top: 22px;
    right: 0;
  }
}

.change-project-btn {
  cursor: none;
  height: 75px;
  width: 100%;
  color: var(--light-color);
  &.next-item {
    bottom: 0;
  }
  &.prev-item {
    top: 0;
  }
}

.project-item {
  position: relative;
  padding-top: 20vh;
  pointer-events: none;
}
</style>
