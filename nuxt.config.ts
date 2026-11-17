import { defineNuxtConfig } from "nuxt/config";
import glsl from "vite-plugin-glsl";

export default defineNuxtConfig({
  runtimeConfig: {
    alchemyToken: "nNWb6lDNz47nmopBgKXeO", // overridden by NUXT_ALCHEMY_TOKEN env var
    public: {
      // nothing here — keep the token private
    },
  },
  sourcemap: {
    client: true,
    server: false,
  },
  devtools: { enabled: true },
  routeRules: {},
  modules: [
    "@nuxt-modules/compression",
    "@nuxt/eslint",
    "@pinia/nuxt",
    // "../canvas3-nuxt/src/module", // Canvas3 Nuxt module local dev path
    "@canvas3/nuxt",
    "x402-nuxt",
  ],

  // x402 payment wall — payTo / CDP keys come from X402_PAY_TO, CDP_API_KEY_ID, CDP_API_KEY_SECRET env vars
  x402: {
    routes: {
      "GET /api/support": {
        price: "$0.001",
        network: "eip155:84532", // Base Sepolia (testnet)
        description: "Canvas3 support content",
      },
    },
  },
  // image: {
  //   target: "static",
  //   dir: "public/",
  // },

  build: {
    transpile: ["gsap", "@canvas3/nuxt"],
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
          if (css[i]?.startsWith("entry")) css.splice(i, 1);
        }
      }
    },
  },
  nitro: {
    compressPublicAssets: true,
    // Bundle viem into the server chunks instead of tracing it into node_modules.
    // x402-nuxt ships its own nested viem, and two copies made Vercel's function
    // import a viem/_esm path that wasn't in the traced output.
    externals: {
      inline: ["viem"],
    },
  },
  compatibilityDate: "2025-01-08",
});
