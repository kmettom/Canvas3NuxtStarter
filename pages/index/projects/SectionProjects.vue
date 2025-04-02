<template>
  <div class="works-section">
    <Container>
      <h2 class="heading-1 text-align-right">
        <span
          v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }"
          v-set-data-attrs="{ cursorcolor: 'light' }"
        >
          <CanvasText :theme="'light'"> WORK </CanvasText>
        </span>
      </h2>

      <div
        id="gallery"
        ref="projectGalleryRef"
        v-onScrollActivate="{
          trackOnly: true,
          bidirectionalActivation: true,
        }"
      >
        <div v-onScrollActivate="{ fixToParentId: 'gallery' }">
          <div
            class="gallery-controls"
            :class="{ active: navigationStore.projects.galleryOpen }"
          >
            <button
              v-set-data-attrs="{
                cursoropacity: 0.7,
                cursorsize: 70,
                cursoricon: '🤏',
              }"
              class="gallery-controls-btn close-btn"
              @click="closeGallery()"
            >
              <IconsClose />
            </button>
            <button
              v-if="nextProjectName"
              v-set-data-attrs="{
                cursoropacity: 0.7,
                cursorsize: 70,
                cursoricon: '👇',
              }"
              class="gallery-controls-btn change-project-btn next-item"
              @click="navigationStore.scrollToProject(activeProjectIndex + 1)"
            >
              next: {{ nextProjectName }} 👇
            </button>
            <button
              v-if="prevProjectName"
              v-set-data-attrs="{
                cursoropacity: 0.7,
                cursorsize: 70,
                cursoricon: '👆',
              }"
              class="gallery-controls-btn change-project-btn prev-item"
              @click="navigationStore.scrollToProject(activeProjectIndex - 1)"
            >
              previous: {{ prevProjectName }} 👆
            </button>
          </div>
        </div>
        <div class="gallery-controls-margin" />
        <div
          v-for="(project, index) in projectsData"
          :key="index"
          class="project-item"
          :class="{ first: index === 0 }"
        >
          <!--          :ref="projectItemRefs.set"-->

          <Project
            :project="project"
            :index="index"
            @open-gallery="openProject(index)"
          />
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from '~/components/common/Container.vue';
import projectsData from '~/content/projects.json';
import Project from '~/pages/index/projects/Project.vue';
import IconsClose from '~/components/common/icons/close.client.vue';

const navigationStore = useNavigationStore();

const projects = ref(projectsData);

const updateProjectReferenceList = () => {
  const projectItemRefs =
    projectGalleryRef.value.querySelectorAll('.project-item');
  navigationStore.setProjectRefs(projectItemRefs);
};

onMounted(() => {
  updateProjectReferenceList();
});

onUpdated(() => {
  updateProjectReferenceList();
});

const projectGalleryRef = ref();
navigationStore.setGalleryRef(projectGalleryRef);

const activeProjectIndex = computed(() => {
  return navigationStore.projects.activeProject.index ?? 0;
});

const nextProjectName = computed(() => {
  return projects.value[activeProjectIndex.value + 1]?.name ?? null;
});
const prevProjectName = computed(() => {
  return projects.value[activeProjectIndex.value - 1]?.name ?? null;
});

const openProject = (index) => {
  navigationStore.openGalleryProject(index);
};

const closeGallery = () => {
  navigationStore.closeGallery();
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
