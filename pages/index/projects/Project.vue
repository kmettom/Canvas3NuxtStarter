<script setup>
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useDisplayStore } from '~/stores/display';

const displayStore = useDisplayStore();
const navigationStore = useNavigationStore();

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

const projectElClasses = computed(() => {
  return `project ${props.project.position?.alignRight ? ' project-right ' : ''}`;
});

const projectNumber = computed(() => {
  return '0' + (props.index + 1).toString();
});

const projectNumberTheme = computed(() => {
  return 'light';
});

const hoverProject = (status) => {
  if (status) {
    projectImageUniforms.value.uHover.active =
      !navigationStore.projects.galleryOpen;
  } else {
    projectImageUniforms.value.uHover.active = false;
  }
};

const projectImageUniforms = ref({
  uHover: { active: false, duration: 0.55 },
  uImageGallery: { active: false, duration: 0.5 },
  uImageGalleryActive: { active: false, duration: 0.5 },
});

const emit = defineEmits(['openGallery']);
const scrollSpeedUpdate = computed(() => {
  if (!props.project.scrollSpeed) return;
  return navigationStore.projects.galleryToOpen || displayStore.isTablet
    ? 0.0001
    : props.project.scrollSpeed;
});

watch(
  () => navigationStore.projects.galleryOpen,
  (galleryOpen) => {
    projectImageUniforms.value.uImageGallery.active = galleryOpen;
    if (galleryOpen === false) {
      projectImageUniforms.value.uAniInImage = { active: true, duration: 0 };
      projectImageUniforms.value.uAniInText = { active: true, duration: 0 };
    }
  },
);

watch(
  () => navigationStore.projects.activeProject.index,
  (activeProjectIndex) => {
    projectImageUniforms.value.uImageGalleryActive.active =
      activeProjectIndex === props.index;
  },
);
</script>

<template>
  <div
    v-onScrollActivate="{
      activeRange: navigationStore.projects.galleryToOpen ? 1 : 0.95,
      activateOnce: !navigationStore.projects.galleryToOpen,
      activeRangeOrigin: navigationStore.projects.galleryToOpen ? 0.5 : 1,
      bidirectionalActivation: navigationStore.projects.galleryToOpen,
      activateCallback: () => {
        navigationStore.setActiveProject(props.index);
      },
      scrollSpeedSetTo: { value: scrollSpeedUpdate, duration: 0.25 },
    }"
    :class="projectElClasses"
    :style="`${project.position?.bottom && !displayStore.isTablet ? 'bottom:' + project.position?.bottom + 'vh' : 'initial'};`"
  >
    <div
      v-set-data-attrs="{
        cursorsize: navigationStore.projects.galleryOpen ? 15 : 75,
        cursoropacity: navigationStore.projects.galleryOpen ? 1 : 0.9,
        cursoricon: navigationStore.projects.galleryOpen ? 'false' : 'true',
      }"
      :class="`project-wrapper ${project.position?.alignRight ? ' project-right ' : ''}`"
      @mouseover="hoverProject(true)"
      @mouseleave="hoverProject(false)"
      @click="emit('openGallery')"
    >
      <div class="project-info-wrapper">
        <div class="heading-3 project-index">
          <CanvasText
            :theme="projectNumberTheme"
            :uniforms="projectImageUniforms"
          >
            {{ projectNumber }}
          </CanvasText>
        </div>
        <div class="expand-description">
          <div class="statistics">
            <div class="info-row">
              <div class="info-category">client:</div>
              <div>{{ project.name }}</div>
            </div>
            <div class="info-row">
              <div class="info-category">year:</div>
              <div>{{ project.year }}</div>
            </div>
            <div v-if="project.award" class="info-row">
              <div class="info-category">award:</div>
              <div>{{ project.award }}</div>
            </div>
          </div>
          <p class="project-description body-m" v-html="project.description" />
          <div
            v-set-data-attrs="{
              cursoropacity: 0.7,
              cursorsize: 70,
              cursoricon: 'true',
            }"
          >
            <a class="project-link" :href="project.websiteLink" target="_blank"
              >👉 visit website</a
            >
          </div>
        </div>
      </div>

      <div
        class="project-image"
        :style="`width:${project.image.size?.width ?? 'auto'};height:${project.image.size?.height ?? 'auto'};`"
      >
        <CanvasImage
          :src-link="project.image.src"
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
