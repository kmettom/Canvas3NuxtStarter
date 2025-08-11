import { defineNuxtConfig } from "nuxt/config";
import glsl from "vite-plugin-glsl";

export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {},
  modules: [
    "@nuxtjs/sanity",
    "@nuxt-modules/compression",
    "@nuxt/eslint",
    "@pinia/nuxt",
    // "../canvas3-nuxt/src/module", // Canvas3 Nuxt module local dev path
    "canvas3-nuxt",
  ],
  sanity: {
    projectId: process.env.NUXT_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_SANITY_DATASET,
    apiVersion: process.env.NUXT_SANITY_API_VERSION || "2025-04-01",
    token: process.env.NUXT_SANITY_API_READ_TOKEN, // Only required when using a private dataset
    visualEditing: {
      token: process.env.NUXT_SANITY_API_READ_TOKEN,
      studioUrl: process.env.NUXT_SANITY_STUDIO_URL,
      zIndex: 51,
    },
  },
  runtimeConfig: {
    public: {
      studioUrl: process.env.NUXT_SANITY_STUDIO_URL,
    },
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
