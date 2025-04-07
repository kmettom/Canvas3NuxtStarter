<template>
  <div class="code-container">
    <!--    <pre>-->
    <!--    <code>-->
    <slot />
    <!--    </code>-->
    <!--  </pre>-->
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.code-container {
  display: inline-block;
  border-radius: 5px;
  margin: 10px 0;
  background: black;
  padding: 15px 10px;
}
</style>
