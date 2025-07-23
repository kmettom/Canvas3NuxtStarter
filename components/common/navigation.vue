<template>
  <div class="body-xs navigation-bar">
    <nav class="navigation-items">
      <div
        v-for="(navItem, index) in navigationItems"
        :key="navItem.id"
        :ref="navItemRefs.set"
        v-set-data-attrs="{
          cursorsize: 25,
          cursoropacity: 0.65,
          cursorcolor: 'light',
        }"
        class="navigation-item"
        :class="{ active: activeNav === navItem.id }"
        @click="goToSection(navItem.id)"
        @mouseenter="navigationHoverAnimate(index)"
      >
        <span>
          {{ navItem.name }}
        </span>
      </div>
    </nav>
  </div>
</template>
<script setup>
import {
  navigationFirstEnter,
  navigationShow,
} from "~/utils/animations/navigation";
import { gsap } from "gsap";
import { useTemplateRefsList } from "@vueuse/core";
// import { Canvas3 } from "~/utils/canvas3";

const navItemRefs = useTemplateRefsList();
const navAniDuration = 0.15;
const navAniY = 10;

const navigationHoverAnimate = (index) => {
  const tl = gsap.timeline();
  const text = navItemRefs.value[index].querySelector("span");
  tl.to(text, {
    duration: navAniDuration,
    y: navAniY,
  });
  tl.set(text, {
    y: -navAniY,
  });
  tl.to(text, {
    duration: navAniDuration,
    y: 0,
  });
};

const navigationStore = useNavigationStore();

const goToSection = (sectionId) => {
  console.log("sectionId", sectionId);
  //TODO: navigation go to section scroll
  // Canvas3.scrollToElBySelector(
  //   `.page-section[data-nav-id="${sectionId}"]`,
  //   0.75,
  // );
};

const navigationItems = computed(() => navigationStore.navigationItems);
const activeNav = computed(() => navigationStore.activeNavItem);

onMounted(() => {
  navigationFirstEnter();
});

watch(
  () => navigationStore.navVisible,
  (isVisible) => {
    navigationShow(isVisible);
  },
);
</script>
<style lang="scss">
.navigation-bar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  z-index: 9;
  opacity: 0;
  pointer-events: none;
}

.navigation-items {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.navigation-item {
  line-height: 20px;
  pointer-events: auto;
  overflow-y: hidden;

  span {
    display: inline-block;
    position: relative;
  }

  &:hover span {
    font-weight: bold;
  }

  &:before {
    opacity: 0;
    content: "👉";
    display: inline-block;
    margin-right: 4px;
    position: relative;
    transform: translateX(-10px);
    transition: ease all 0.3s;
  }

  &.active {
    font-weight: bold;

    &::before {
      transform: translateX(0px);
      opacity: 1;
    }
  }
}

.location {
  display: flex;
  @include respond-width($w-xs) {
    flex-direction: column;
    #splitter {
      display: none;
    }
  }
}
</style>
