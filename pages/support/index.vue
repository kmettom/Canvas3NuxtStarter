<template>
  <div class="page-container support-page">
    <h1 class="heading-2 support-headline">Support</h1>

    <div
        ref="gltfElCup"
        v-canvas3-gltf-model="gltfBindingCup"
        class="gltf-cup-el"
    />

    <div class="support-paywall">
      <p>🔒 The support page is behind an x402 payment wall.</p>
      <p v-if="price" class="body-s">
        Price: {{ price.amountFormatted }} on {{ price.networkName }}
      </p>
      <p v-else class="body-s">Pay with USDC to unlock.</p>

      <button
        v-if="!wallet.isConnected"
        class="support-button"
        :disabled="wallet.isLoading"
        @click="connect"
      >
        {{ wallet.isLoading ? "Connecting..." : "Connect MetaMask" }}
      </button>
      <button
        v-else
        class="support-button"
        :disabled="isPaying"
        @click="handleUnlock"
      >
        {{
          isPaying
            ? "Processing payment..."
            : price
              ? `Pay ${price.amountFormatted} to unlock`
              : "Pay to unlock"
        }}
      </button>

      <p v-if="wallet.isConnected" class="body-s">
        Wallet: <code>{{ wallet.address }}</code>
      </p>
      <p v-if="errorMessage" class="support-error body-s">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">

import {baseColor, baseEnvIntensity, baseLightPositionRight} from "~/utils/playground/gltf-model/gltf-constants";

definePageMeta({
  // Already paid: skip the paywall and show the content page
  middleware: () => {
    if (useState("support:access").value) return navigateTo("/support/content");
  },
});

const gltfElCup = ref(null);

const gltfBindingCup = ref({
  url: "/gltf/coffee_cup/scene.gltf",
  name: "david",
  zIndex: 1,
  container: gltfElCup.value,
  // positioning: gltfPositioningDavid,
  appearAnimation: {
    duration: 2000,
    ease: "power3.out",
    from: {
      position: { x: 0.0, y: -0.9, z: 0 },
      rotation: { x: 0, y: -Math.PI, z: 0 },
      scale: { x: 0.1, y: 0.1, z: 0.1 },
      lights: { cupKey: { intensity: 0, position: { x: 0, y: 0, z: 0 } } },
    },
    to: {
      position: { x: 0.0, y: 0.0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      lights: { cupKey: { intensity: 1, position: baseLightPositionRight } },
    },
  },
  lighting: {
    environment: "room",
    environmentIntensity: baseEnvIntensity,
    toneMapping: "aces",
    exposure: 1,
    defaultLights: false,
    lights: [
      {
        id: "cupKey",
        type: "directional",
        color: baseColor,
        intensity: 0,
        position: { x: 0, y: 0, z: 0 },
      },
      // {
      //   id: "davidKey2",
      //   type: "directional",
      //   color: blueColor,
      //   intensity: 0,
      //   position: { x: 0, y: 0, z: 0 },
      // },
    ],
  },
});

const { wallet, connect } = useWallet();
const { price, isPaying, error, loadPrice, unlock } = useSupportAccess();

const result = ref<string | null>(null);

const errorMessage = computed(
  () => result.value ?? error.value ?? wallet.value.error,
);

onMounted(loadPrice);

async function handleUnlock() {
  result.value = null;
  // Redirects to /support/content on success
  result.value = await unlock();
}
</script>

<style lang="scss" scoped>
.support-page {
  min-height: 100vh;
  padding-top: 150px;
  padding-bottom: 100px;
}
.support-headline {
  padding-bottom: 40px;
}
.support-paywall {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.support-button {
  align-self: flex-start;
  padding: 12px 24px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}
.support-error {
  color: #e5484d;
  word-break: break-word;
}
code {
  word-break: break-all;
}

.gltf-cup-el {
  height: 250px;
  width: 250px;
  position: absolute;
  top: 0;
  left: 0;
  @include respond-width($w-s) {
    height: 150px;
    width: 150px;
  }
}
</style>
