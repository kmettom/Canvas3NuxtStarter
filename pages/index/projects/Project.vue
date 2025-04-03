<script setup>
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useDisplayStore } from "~/stores/display";

const displayStore = useDisplayStore();

gsap.registerPlugin(SplitText);

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const hoverProject = (status) => {
  projectImageUniforms.value.uHover.active = status;
};

const projectImageUniforms = ref({
  uHover: { active: false, duration: 0.55 },
  uImageGallery: { active: false, duration: 0.5 },
  uImageGalleryActive: { active: false, duration: 0.5 },
});

const scrollSpeedUpdate = computed(() => {
  if (!props.project.scrollSpeed) return;
  return displayStore.isTablet ? 0.0001 : props.project.scrollSpeed;
});
</script>

<template>
  <div
    v-onScrollActivate="{
      activeRange: 0.95,
      // activateOnce: !navigationStore.projects.galleryToOpen,
      // bidirectionalActivation: navigationStore.projects.galleryToOpen,
      // activeRangeOrigin:  1,
      // activateCallback: () => {
      //
      // },
      scrollSpeedSetTo: { value: scrollSpeedUpdate, duration: 0.25 },
    }"
    :class="projectElClasses"
  >
    <div @mouseover="hoverProject(true)" @mouseleave="hoverProject(false)">
      <div class="project-image">
        <CanvasImage
          :src-link="'images/01.JPG'"
          :uniforms="projectImageUniforms"
          :alt="project.alt"
        />
      </div>

      <div class="project-name body-m">
        <span>{{ project.name }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$nameSize: 30px;
.project {
  display: flex;
  justify-content: left;
  position: relative;
  max-width: 100%;
  pointer-events: none;
  &.project-right {
    justify-content: right;
  }
}
.project-wrapper {
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  display: flex;
  max-width: 100%;
}

.project-index {
  position: absolute;
  left: -75px;
  @include respond-width($w-s) {
    position: relative;
    left: 0;
  }
}

.project-image {
  display: inline-block;
  position: relative;
  max-width: 100%;
  max-height: 100%;
  * {
    position: relative;
    width: 100%;
    height: 100%;
  }
}

.project-info-wrapper {
  display: inline-block;
  width: 0;
  height: 0;
  position: relative;
  overflow: hidden;
}

.project-description {
  margin-top: 75px;
  @include respond-width($w-xs) {
    margin-top: 10px;
    font-size: 12px;
  }
}

.expand-description {
  opacity: 0;
  padding: 0 50px 50px 50px;
  position: relative;
  @include respond-width($w-xs) {
    padding: 0 5px 10px 0;
  }
  .statistics {
    height: 50%;
    @include respond-width($w-xs) {
      height: initial;
      padding-bottom: 10px;
    }
    .info-row {
      @include respond-width($w-xs) {
        padding-bottom: 5px;
      }
      * {
        display: inline-block;
        width: 50%;
        @include respond-width($w-xs) {
          width: 100%;
        }
      }
    }
    .info-category {
      @include respond-width($w-xs) {
        font-size: 12px;
      }
    }
  }

  a {
    display: inline-block;
    margin-top: 20px;
    @include respond-width($w-xs) {
      margin-top: 10px;
    }
  }
}

.project-name {
  display: inline-block;
  position: absolute;
  bottom: -$nameSize;
  left: 0;
}
.project-link {
  @include respond-width($w-xs) {
    font-size: 12px;
  }
}
</style>
