<template>
  <div class="page-container support-page">
    <h1 class="heading-2 support-headline">Support</h1>

    <!-- Unlocked: content comes from the paid /api/support response -->
    <div v-if="access" class="support-content">
      <p class="support-badge">Payment confirmed</p>
      <h2 class="body-l">{{ access.content.title }}</h2>
      <p v-for="(paragraph, i) in access.content.paragraphs" :key="i">
        {{ paragraph }}
      </p>
      <p v-if="access.amountFormatted" class="body-s">
        Paid {{ access.amountFormatted }} on {{ access.networkName }}
        <a
          v-if="access.txHash"
          :href="access.explorerTxUrl"
          target="_blank"
          rel="noopener"
          >· view transaction</a
        >
      </p>
    </div>

    <!-- Locked: payment wall -->
    <div v-else class="support-paywall">
      <p>🔒 This page is behind an x402 payment wall.</p>
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
        @click="unlock"
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
interface SupportAccess {
  payer?: string;
  txHash?: string;
  networkName?: string;
  amountFormatted?: string;
  explorerTxUrl?: string;
  content: { title: string; paragraphs: string[] };
}

const SUPPORT_API = "/api/support";

const { wallet, connect } = useWallet();
const { pay, quote, isPaying, error } = useX402Payment();

const access = useState<SupportAccess | null>("support:access", () => null);
const price = ref<Awaited<ReturnType<typeof quote>>>(null);
const payError = ref<string | null>(null);

const errorMessage = computed(
  () => payError.value ?? error.value ?? wallet.value.error,
);

onMounted(async () => {
  // Read price / network from the 402 challenge so it can be shown before paying
  price.value = await quote(SUPPORT_API).catch(() => null);
});

async function unlock() {
  payError.value = null;
  try {
    // Fetches the route; on 402 it signs the payment in MetaMask and retries
    const response = await pay(SUPPORT_API);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      payError.value = `Error: ${response.status} ${body?.message ?? response.statusText}`;
      return;
    }
    access.value = await response.json();
  } catch (err: unknown) {
    payError.value = `Payment error: ${err instanceof Error ? err.message : "Unknown error"}`;
  }
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
.support-paywall,
.support-content {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.support-badge {
  opacity: 0.6;
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
</style>
