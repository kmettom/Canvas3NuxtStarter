import { defineNuxtConfig } from "nuxt/config";
import glsl from "vite-plugin-glsl";

export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {},
  modules: [
    "@nuxt-modules/compression",
    "@nuxt/eslint",
    "@nuxt/content",
    "@nuxt/image",
    "nuxt-viewport",
    "@pinia/nuxt",
    "../canvas3-nuxt/src/module", // Canvas3 Nuxt module local dev path
    // "canvas3-nuxt",
  ],
  image: {
    target: "static",
    dir: "public/",
  },

  build: {
    transpile: ["gsap", "canvas3-nuxt"],
  },

  vite: {
    plugins: [glsl()],
    css: {
      preprocessorOptions: {
        scss: {
          // extractCSS: false,
          additionalData: '@use "~/assets/scss/common.scss" as *;',
        },
      },
    },
  },

  hooks: {
    "build:manifest": (manifest) => {
      const css = manifest["node_modules/nuxt/dist/app/entry.js"]?.css;
      if (css) {
        for (let i = css.length - 1; i >= 0; i--) {
          if (css[i].startsWith("entry")) css.splice(i, 1);
        }
      }
    },
  },
  nitro: {
    compressPublicAssets: true,
  },
  compatibilityDate: "2025-01-08",
});
