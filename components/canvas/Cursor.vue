<template>
  <div id="uniqueCursor" ref="cursorEl">
    <span v-if="!!state.cursorIcon" class="cursor-icon">
      {{ state.cursorIcon }}
    </span>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Canvas } from '~/utils/canvas';

import { useDisplayStore } from '~/stores/display';

const displayStore = useDisplayStore();

const baseSize = 12;
const baseOpacity = 1;
const easingPosition = 2;
const easing = 5;
const cursorEl = ref('cursorEl');

const cursorIcons = [
  '🔥',
  '🕶',
  '🤌',
  '☝',
  '🙃',
  '🚀',
  '😜',
  '😎',
  '🖖',
  '👌',
  '🤘',
  '🌴',
];

const randomIndex = () => {
  setInterval(() => {});
  return Math.floor(Math.random() * cursorIcons.length);
};

const getCursorIcon = () => {
  return cursorIcons[randomIndex()];
};

const state = reactive({
  curNewSize: null,
  curNewOpacity: baseOpacity,
  currentSize: null,
  currentOpacity: null,
  cursorX: null,
  cursorY: null,
  curNewX: null,
  curNewY: null,
  curNewColor: `rgba(191, 192, 178, ${baseOpacity})`, // Default color
  cursorInitialized: false,
  cursorIcon: null,
});

const cursorInit = () => {
  // Set up draw callback
  Canvas.animations.cursorCallback = draw;

  // Track mouse movements
  window.onmousemove = (event) => {
    cursorTrack(event);
  };

  // Handle mouse out of window
  document.addEventListener('mouseout', (e) => {
    const from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName === 'HTML') {
      state.curNewSize = 1;
    }
  });
};

// Track mouse movement
const cursorTrack = (event) => {
  // Update cursor size, opacity, and position
  state.curNewSize = event.target.dataset.cursorsize
    ? Number(event.target.dataset.cursorsize)
    : baseSize;

  state.curNewOpacity = event.target.dataset.cursoropacity
    ? Number(event.target.dataset.cursoropacity)
    : baseOpacity;

  state.curNewX = event.clientX;
  state.curNewY = event.clientY;

  state.curNewColor =
    event.target.dataset.cursorcolor &&
    event.target.dataset.cursorcolor === 'dark'
      ? `rgba(27, 24, 24, ${state.curNewOpacity})` //27,24,24
      : `rgba(191, 192, 178, ${state.curNewOpacity})`; //191,192,178

  if (
    event.target.dataset.cursoricon &&
    event.target.dataset.cursoricon !== 'false' &&
    !state.cursorIcon
  ) {
    state.cursorIcon =
      event.target.dataset.cursoricon === 'true'
        ? getCursorIcon()
        : event.target.dataset.cursoricon;
  } else if (!event.target.dataset.cursoricon && state.cursorIcon) {
    state.cursorIcon = null;
  }

  // Initialize cursor if not already initialized
  if (!state.cursorInitialized) {
    state.currentSize = baseSize;
    state.cursorX = event.clientX;
    state.cursorY = event.clientY;
    state.cursorInitialized = true;
  }
};

// Draw the cursor with easing
const draw = () => {
  // Smoothly update position
  const dX = state.curNewX - state.cursorX;
  const dY = state.curNewY - state.cursorY;
  state.cursorX += dX / easingPosition;
  state.cursorY += dY / easingPosition;

  // Apply styles to the cursor element
  const t3d = `translate3d(${state.cursorX - state.currentSize / 2}px, ${
    state.cursorY - state.currentSize / 2
  }px, 0)`;
  if (cursorEl.value) {
    cursorEl.value.style.webkitTransform = t3d;
    cursorEl.value.style.transform = t3d;

    // Smoothly update size
    const dD = state.curNewSize - state.currentSize;
    state.currentSize += dD / easing;
    cursorEl.value.style.height = `${state.currentSize}px`;
    cursorEl.value.style.width = `${state.currentSize}px`;

    // Update color
    cursorEl.value.style.background = state.curNewColor;
  }
};

// Lifecycle hook: Mounted
onMounted(() => {
  if (!displayStore.isMobile && !displayStore.prefersReducedMotion) {
    cursorInit();
  }
});
</script>

<style lang="scss" scoped>
#uniqueCursor {
  pointer-events: none;
  position: fixed;
  text-align: center;
  z-index: 99;
  background: var(--dark-color);
  border-radius: 50%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cursor-icon {
  font-size: 31px;
}
</style>
