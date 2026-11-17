<template>
  <div class="support-section">
    <Container>
      <h2 class="heading-2">
        <span
          v-canvas3-scroll-action="{ activeRange: 0.9, activateOnce: true }"
        >
          Support
        </span>
      </h2>
      <NuxtLink class="support-link" href="/support">
        <div class="support-link-txt">Support Canvas3 development 👉</div>
      </NuxtLink>
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
</script>

<style lang="scss" scoped>
.support-section {
  position: relative;
  min-height: 500px;
}
.support-link {
  padding: 30px 30px 30px 0;
  display: block;
  position: relative;
  color: inherit;
}
.heading-2 {
  padding-top: 50px;
  padding-bottom: 20px;
}
</style>
