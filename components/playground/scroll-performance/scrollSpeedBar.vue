<script setup lang="ts">
withDefaults(defineProps<{ showPhotoCredentials?: boolean }>(), {
  showPhotoCredentials: true,
});

const scrollSpeedAniEl = ref<HTMLElement | null>(null);
const scrollSpeedEl = ref<HTMLElement | null>(null);
const enterAniWrapperEl = ref<HTMLElement | null>(null);
const scrollSpeedCoef = ref<string>("0%");

const scrollSpeedCallback = (_item: any, speed: number) => {
  const newSpeedCoef = speed < 0.03 ? 0 : speed;
  scrollSpeedCoef.value = (newSpeedCoef * 100).toFixed(0) + "%";
  if (scrollSpeedAniEl.value)
    scrollSpeedAniEl.value.style.width =
      Number(newSpeedCoef.toFixed(2)) * 100 + "%";
};

const scrollSpeedBarOptions = {
  activeRange: 1,
  fixToParent: {
    containerId: "scrollSpeedBar",
    fixPosition: 0,
  },
  onScrollCallback: scrollSpeedCallback,
};

const fps = ref<number | null>(null);
const fpsInterval = ref<null | number>();

onMounted(() => {
  if (scrollSpeedEl.value) {
    scrollSpeedBarOptions.fixToParent.fixPosition = Number(
      (1 - scrollSpeedEl.value.clientHeight / window.innerHeight).toFixed(4),
    );
  }
  if (enterAniWrapperEl.value) {
    enterAniWrapperEl.value.classList.add("active");
  }

  fpsInterval.value = setInterval(() => {
    fps.value = Canvas3.getFPS();
  }, 500);
});
onBeforeUnmount(() => {
  fpsInterval.value = null;
});
</script>

<template>
  <div
    id="scrollSpeedBar"
    v-canvas3-scroll-action="scrollSpeedBarOptions"
    class="scroll-speed-container"
  >
    <div ref="scrollSpeedEl" class="scroll-bar-wrapper">
      <div ref="enterAniWrapperEl" class="enter-ani-wrapper">
        <div class="scroll-speed-status-bar">
          <div class="scroll-speed-text">
            Scroll speed: {{ scrollSpeedCoef }}
          </div>
          <div class="scroll-speed-ani-wrapper">
            <div ref="scrollSpeedAniEl" class="scroll-speed-ani" />
          </div>
          <div v-if="fps" class="fps-text">FPS: {{ fps }}</div>
        </div>
        <div class="bg-light credits">
          Developed By
          <a href="https://tomaskmet.com" target="_blank">Tomas Kmet</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scroll-speed-container {
  font-family: "PP Neue Montreal Bold", serif;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
  transition: ease all 0.5s;
  opacity: 0;
  &.active {
    opacity: 1;
  }
}

.scroll-bar-wrapper {
  position: relative;
}

.credits {
  background: transparent;
  text-align: center;
  color: var(--dark-color);
  text-transform: uppercase;
  a {
    pointer-events: auto;
    color: var(--dark-color);
    text-decoration: none;
  }
}

.scroll-speed-status-bar {
  padding: 0;
  position: relative;
  display: flex;
}
.bg-light {
  padding: 0;
  background: var(--light-color);
}
.fps-text,
.scroll-speed-text {
  text-transform: uppercase;
  font-size: 14px;
  z-index: 2;
  color: var(--light-color);
  margin: 3px 3px 3px 15px;
}
.fps-text {
  width: 200px;
  text-align: right;
  margin-right: 10px;
}
.scroll-speed-text {
  width: 200px;
}
.scroll-speed-ani-wrapper {
  width: calc(100% - 400px);
  margin-top: 10px;
  text-align: center;
}

.scroll-speed-ani {
  margin: 0 auto;
  width: 0;
  height: 5px;
  border-radius: 5px;
  background: var(--light-color);
  z-index: 1;
}
.enter-ani-wrapper {
  position: relative;
  top: 60px;
  transition: ease all 0.35s;
  transition-delay: 0.55s;
  &.active {
    top: 0;
  }
}
</style>
