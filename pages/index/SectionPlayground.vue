<template>
  <div class="playground-section">
    <Container>
      <NuxtLink class="playground-link" href="/playground">
        <h2 class="heading-2">
          <span v-action-on-scroll="{ activeRange: 0.9, activateOnce: true }">
            <!--          <Canvas3Text :theme="'light'"> EXAMPLES </Canvas3Text>-->
            Playground
          </span>
          <span class="arrow"> 👀</span>
        </h2>
        <div>Enter playground with more examples and experiments 👉</div>
      </NuxtLink>
    </Container>
  </div>
</template>

<script setup lang="ts">
import Container from "~/components/common/Container.vue";
</script>

<style lang="scss" scoped>
.playground-link {
  display: block;
  position: relative;
  min-height: 500px;
  text-decoration: none;
  color: inherit;
  &:hover {
    .arrow {
      opacity: 1;
    }
  }
  .arrow {
    position: relative;
    transition: ease all 0.3s;
    opacity: 0;
  }
}
.heading-2 {
  padding-top: 50px;
  padding-bottom: 20px;
}

.heading-example {
  padding-bottom: 10px;
}

.examples-row {
  display: flex;
  padding: 20px 0;
}

.example-row-second {
  padding-top: 75px;
}

.example-wrapper {
  width: 50%;
  padding: 0 15px;
}

.example-txt {
  padding: 10px 0;
  position: relative;
}

.fixed-scroll-example {
  margin-right: 10px;
  border-right: 1px solid var(--light-color);
  height: 1000px;
  margin-bottom: 100px;
}

.scroll-speed-ani {
  position: absolute;
  bottom: 2px;
  left: 0;
  border-bottom: 5px solid var(--light-color);
}

.example-activate-txt {
  //color: var(--light-color);
  opacity: 0;
  position: absolute;
  font-weight: bold;
  bottom: 10px;
  right: 0;
}
</style>
