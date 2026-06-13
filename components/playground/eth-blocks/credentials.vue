<script setup lang="ts"></script>

<template>
  <div
    id="credentials"
    v-action-on-scroll="{
      activeRange: 0.9,
      fixToParent: {
        containerId: 'credentials',
        fixPosition: 0,
        margin: 0,
      },
    }"
    class="credentails"
  >
    <div>
      <div class="">
        <span class="cred-name"> Design and photography by: </span>
        <a
          class="cred-link"
          href="https://www.instagram.com/jagodakondratiuk"
          target="_blank"
          >Jagoda Kondratiuk</a
        >
      </div>
      <div>
        <span class="cred-name">Developed by:</span>
        <a class="cred-link" href="http://www.tomaskmet.com" target="_blank"
          >Tomas Kmet</a
        >
      </div>
      <div>
        <span class="cred-name">Network:</span>
        <a class="cred-link" href="https://etherscan.io/blocks" target="_blank"
          >Ethereum</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
#credentials {
  position: absolute;
  padding: 20px;
  height: 100%;
  opacity: 0;
  a {
    color: white;
    text-decoration: none;
  }
  .cred-link,
  .cred-name {
    position: relative;
  }
}
</style>
