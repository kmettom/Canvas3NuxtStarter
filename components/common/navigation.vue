<template>
  <div class="body-xs navigation-bar" :class="{ dark: navContrastSwitched }">
    <div class="location">
      <span>Portugal</span>
      <span id="splitter">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
      <span>{{ localTime }}</span>
    </div>

    <div>Folio {{ currentYear }}</div>

    <nav class="navigation-items">
      <div
        v-for="(navItem, index) in navigationItems"
        :key="navItem.id"
        :ref="navItemRefs.set"
        v-set-data-attrs="{
          cursorsize: 25,
          cursoropacity: 0.65,
          cursorcolor: navContrastSwitched ? 'dark' : 'light',
        }"
        class="navigation-item"
        :style="`pointer-events: ${navigationStore.projects.galleryOpen ? 'none' : 'auto'};`"
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
} from '~/utils/animations/navigation';
import { gsap } from 'gsap';
import { useTemplateRefsList } from '@vueuse/core';

const navItemRefs = useTemplateRefsList();
const navAniDuration = 0.15;
const navAniY = 10;

const navigationHoverAnimate = (index) => {
  const tl = gsap.timeline();
  const text = navItemRefs.value[index].querySelector('span');
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
  Canvas.scrollToElBySelector(
    `.page-section[data-nav-id="${sectionId}"]`,
    0.75,
  );
};

const currentYear = new Date().getFullYear().toString().slice(-2);

const localTime = ref('');
const timezone = 'Europe/Lisbon';

const navigationItems = computed(() => navigationStore.navigationItems);
const activeNav = computed(() => navigationStore.activeNavItem);
const navContrastSwitched = computed(() => navigationStore.navContrastSwitched);

let intervalId = null;
function updateLisbonTime() {
  localTime.value = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

onMounted(() => {
  updateLisbonTime();
  intervalId = setInterval(updateLisbonTime, 60000);
  navigationFirstEnter();
});

onUnmounted(() => {
  clearInterval(intervalId);
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

  &.dark {
    color: var(--dark-color);

    .navigation-item {
      &:after {
        color: var(--dark-color);
      }
    }
  }
}

.navigation-items {
  display: flex;
  flex-direction: column;
  text-align: right;
}
.navigation-item {
  cursor: none;
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
    content: '👉';
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
