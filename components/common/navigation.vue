<template>
  <div class="body-xs navigation-bar">
    <nav v-if="homePage" class="navigation-items">
      <div
        v-for="(navItem, index) in navigationItems"
        :key="navItem.id"
        :ref="navItemRefs.set"
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
    <nav v-else class="navigation-items">
      <NuxtLink
        :ref="navItemRefs.set"
        href="/"
        class="navigation-item nav-play nav-link-home"
        @mouseenter="navigationHoverAnimatePlay($el, 'nav-link-home')"
      >
        <span> Home </span>
      </NuxtLink>
      <NuxtLink
        :ref="navItemRefs.set"
        href="/playground"
        class="navigation-item nav-play nav-link-play"
        @mouseenter="navigationHoverAnimatePlay($el, 'nav-link-play')"
      >
        <span> Playground </span>
      </NuxtLink>
    </nav>
  </div>
</template>
<script setup lang="ts">
import {
  navigationFirstEnter,
  navigationShow,
} from "~/utils/animations/navigation";
import { gsap } from "gsap";
import { useTemplateRefsList } from "@vueuse/core";

const navItemRefs = useTemplateRefsList();
const navAniDuration = 0.15;
const navAniY = 10;

const route = useRoute();

const homePage = computed(() => {
  return route.name === "index";
});

const navigationHoverAnimatePlay = (el, elClassName) => {
  console.log("el", el);
  const text = el?.querySelector(`.${elClassName} span`);
  animateTextSpan(text);
};

const animateTextSpan = (text) => {
  if (!text) return;
  const tl = gsap.timeline();
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

const navigationHoverAnimate = (index: number) => {
  const text = navItemRefs.value[index]?.querySelector("span");
  animateTextSpan(text);
};

const navigationStore = useNavigationStore();

const goToSection = (sectionId: string) => {
  Canvas3.scrollToElBySelector(
    `.page-section[data-nav-id="${sectionId}"]`,
    0.75,
  );
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
  z-index: 99;
  opacity: 0;
  pointer-events: none;
}

.navigation-items {
  display: flex;
  flex-direction: column;
  text-align: right;
}
.nav-play {
  color: inherit;
  text-decoration: none;
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
