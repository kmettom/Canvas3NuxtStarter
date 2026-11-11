<script setup lang="ts">
import gsap from "gsap";

withDefaults(defineProps<{ showPhotoCredentials?: boolean }>(), {
  showPhotoCredentials: true,
});

const scrollSpeedAniEl = ref<HTMLElement | null>(null);
const scrollSpeedCoef = ref(0);

const scrollSpeedCallback = (_item: any, speed: number) => {
  const newSpeedCoef = speed < 0.03 ? 0 : speed;
  scrollSpeedCoef.value = Number(newSpeedCoef.toFixed(2)) * 100;
  gsap.set(scrollSpeedAniEl.value, {
    width: `${newSpeedCoef * 100}%`,
  });
};

const scrollSpeedBarOptions = computed(() => ({
  activeRange: 1,
  fixToParent: {
    containerId: "scrollSpeedBar",
    fixPosition: 0.97,
  },
  onScrollCallback: scrollSpeedCallback,
}));

const fps = ref<number | null>(null);
const fpsInterval = ref<null | number>();

onMounted(() => {
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
<!--    <div></div>-->

    <div class="scroll-speed-status-bar">
<!--      <div class="bg-dark credits">-->
<!--        Developed By <a href="https://tomaskmet.com" target="_blank">Tomas Kmet</a>-->
<!--      </div>-->
      <div class="bg-light">
        <div class="scroll-speed-text">Scroll speed: {{ scrollSpeedCoef }}%</div>
        <div class="scroll-speed-ani-wrapper">
          <div ref="scrollSpeedAniEl" class="scroll-speed-ani" />
        </div>
        <div v-if="fps" class="fps-text">FPS: {{ fps }}</div>
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
}

.credits{
  background: transparent;
}

.scroll-speed-status-bar {
  padding: 0;
  height: 30px;
  position: relative;
  background: var(--light-color);
}
.bg-light{
  padding: 0;
  display: flex;
  background: var(--light-color);
}
.fps-text,
.scroll-speed-text {
  text-transform: uppercase;
  font-size: 14px;
  z-index: 2;
  color: var(--dark-color);
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
  margin-top: 7px;
  text-align: center;
}

.scroll-speed-ani {
  margin: 0 auto;
  width: 0;
  height: 10px;
  border-radius: 5px;
  background: var(--dark-color);
  z-index: 1;
}
.cred-holder {
  position: absolute;
  top: 35px;
  height: 200px;
  width: 100%;
  color: var(--dark-color);
  font-size: 20px;
  font-weight: 100;
  text-transform: uppercase;
  .person {
    text-align: center;
    margin: 15px;
  }
  a {
    color: var(--dark-color);
    pointer-events: auto;
  }
}
</style>
