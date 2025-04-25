<template>
  <div id="footer" class="body-xs">
    <a
      id="rights"
      v-set-data-attrs="{
        cursoropacity: 0.7,
        cursorsize: 70,
      }"
      href="https://783studio.com"
      target="_blank"
    >
      © {{ new Date().getFullYear() }} Studio 783&nbsp;&nbsp;|&nbsp;&nbsp;All
      rights reserved
    </a>
    <span id="font"
      >Font: Pangram Pangram<span id="fontSeparator"
        >&nbsp;&nbsp;|&nbsp;&nbsp;</span
      ></span
    >
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
#footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;

  @include respond-width($w-s) {
    padding-top: 5px;
    padding-bottom: 5px;
  }

  & #fontSeparator {
    display: none;
  }

  @include respond-width($w-s) {
    display: block;
    text-align: center;

    & #rights {
      display: block;
    }

    & #fontSeparator {
      display: inline;
    }
  }
  a {
    color: var(--light-color);
  }
}
</style>
