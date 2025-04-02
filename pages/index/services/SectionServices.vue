<template>
  <div class="services-section">
    <Container>
      <h2 class="heading-1">
        <span v-onScrollActivate="{ activeRange: 0.99, activateOnce: true }">
          <CanvasText :theme="'dark'"> SERVICES </CanvasText>
        </span>
      </h2>

      <div id="servicesList" class="services-wrapper">
        <div
          v-for="(service, index) in services"
          :key="index"
          v-onScrollActivate="{
            activeRange: 0.75,
            fixToParentId: 'servicesList',
            onScrollCallback: (item: any, speed: any) => {
              if (speed < 0.03) return;
              setServiceBlockBlur(index, item.elNode, service.styles);
            },
          }"
          class="service-item"
          :style="serviceBoxStyle(Number(index))"
          @mouseover="setItemActive(index, true)"
          @mouseleave="setItemActive(index, false)"
        >
          <div class="" style="transform-origin: 0% 0%">
            <div class="service-item-inner">
              <Service
                :title="service.title"
                :icon="service.icon"
                :text="service.text"
                :styles="service.styles"
                :block-size="serviceBlockSize"
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script setup>
import Container from '~/components/common/Container.vue';
import services from '~/content/services.model.json';
import Service from '~/pages/index/services/Service.vue';
import gsap from 'gsap';

const serviceBlockSize = 340;
const serviceTopPadding = 50;
const maxBlur = 5;

const activeItemIndex = ref();
const setItemActive = (index, isActive) => {
  activeItemIndex.value = isActive ? index : null;
};

const setServiceBlockBlur = (index, elNode, styles) => {
  const aniInCoef = Math.min(
    1,
    1 -
      (elNode.getBoundingClientRect().top - serviceBlockSize / 2) /
        window.innerHeight,
  );
  let aniOutCoef = Math.min(
    1,
    Math.max(
      0,
      -(elNode.getBoundingClientRect().top + serviceBlockSize / 3) /
        window.innerHeight,
    ),
  );
  if (index === services.length - 1) {
    aniOutCoef = 0;
  }
  const rotateDeg = styles.rotate * aniInCoef;
  const blur = 5 * (1 - aniInCoef) + 15 * aniOutCoef;
  if (blur > maxBlur) return;
  gsap.set(elNode.querySelector('.service-item-inner'), {
    filter: `blur(${blur}px)`,
    rotation: rotateDeg,
  });
};

const serviceMarginTop = (indexInRow) => {
  return ` margin-top:${indexInRow * serviceBlockSize}px; `;
};

const servicePaddingTop = (index) => {
  const rowIndex = Math.floor(index / 3);
  return ` padding-top: ${serviceTopPadding + (rowIndex * serviceBlockSize) / 2}px; `;
};

const serviceBoxStyle = (index) => {
  let indexInRow = index;
  if (index > 2) {
    indexInRow = index - 3;
  }
  return `${serviceMarginTop(indexInRow)} ${servicePaddingTop(index)} z-index: ${indexInRow}; translate(0,0); transform-origin: 50% 50%;`;
};
</script>

<style lang="scss" scoped>
.services-section {
  padding-top: 50px;
  padding-bottom: 425px;
  background-color: var(--light-color);
  color: var(--dark-color);
  text-align: center;

  @include respond-width($w-xs) {
    & h2 {
      margin-bottom: 50px;
    }
  }
}
.heading-1 {
  margin-top: 75px;
  @include respond-width($w-xs) {
    margin-top: 35px;
  }
}
.services-wrapper {
  position: relative;
}
.service-item {
  display: inline-block;
  vertical-align: top;
  &.active .service-item-inner {
    opacity: 1;
  }
}
.service-item-inner {
  transition: opacity 0.5s ease;
  opacity: 0;
}
</style>
