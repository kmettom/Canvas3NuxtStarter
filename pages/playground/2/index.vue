<template>
  <div class="page-container">
    <h1 class="headline">
      <CanvasText :theme="'light'" :uniforms="mainTextInUniforms">
        2
      </CanvasText>
    </h1>
    <div ref="infiniteParent">
      <div
        ref="play2el"
        v-onScrollActivate="{
          activeRange: 1,
          onScrollCallback: (el, speed, bounds) => {
            console.log(bounds);
            const clonedElement = play2el.value.cloneNode(true);

            clonedElement.value.id = 'clonedElement';
            if (bounds.bottom < 1000) {
              infiniteParent.value.appendChild(clonedElement);
            } else if (bounds.top > 200) {
              infiniteParent.value.appendChild(clonedElement);
            }
            // else{
            //
            // }
          },
        }"
        class="play2-el"
      >
        <div class="play-2-section">I</div>
        <div class="play-2-section" />
        <div class="play-2-section" />
        <div class="play-2-section" />
        <div class="play-2-section">X</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { infiniteLoopScrollSection } from '~/utils/play/play2';

useSeoMeta({
  title: 'Tomas Kmet - Web developer - Playground',
  ogTitle: 'Tomas Kmet - Web developer - Playground',
  description: 'Tomas Kmet - Web developer - Playground',
  ogDescription: 'Tomas Kmet - Web developer - Playground',
});

const mainTextInUniforms = {
  uAniInText: { value: 1, duration: 1 },
};

const play2el = ref('play2el');
const infiniteParent = ref('infiniteParent');

onMounted(() => {
  setTimeout(() => {
    infiniteLoopScrollSection(play2el.value);
  }, 1000);
});
</script>
<style lang="scss" scoped>
.play2-el {
  width: 100%;
}

.play-2-section {
  height: 200px;
  margin: 50px;
  border: purple 2px solid;
  border-radius: 15px;
}
</style>
