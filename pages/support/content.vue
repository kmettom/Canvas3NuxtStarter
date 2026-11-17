<template>
  <div v-if="access" class="page-container support-content-page">
    <p class="support-badge body-s">Payment confirmed</p>
    <h1 class="heading-2 support-headline">{{ access.content.title }}</h1>

    <div class="support-content">
      <p v-for="(paragraph, i) in access.content.paragraphs" :key="i">
        {{ paragraph }}
      </p>
    </div>

    <div class="support-receipt body-s">
      <p v-if="access.amountFormatted">
        Paid {{ access.amountFormatted }} on {{ access.networkName }}
      </p>
      <p v-if="access.payer">
        Payer: <code>{{ access.payer }}</code>
      </p>
      <p v-if="access.txHash">
        Transaction:
        <a :href="access.explorerTxUrl" target="_blank" rel="noopener">
          <code>{{ access.txHash }}</code>
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  // Only reachable after a successful payment; content comes from the paid /api/support response
  middleware: () => {
    if (!useState("support:access").value) return navigateTo("/support");
  },
});

const { access } = useSupportAccess();
</script>

<style lang="scss" scoped>
.support-content-page {
  min-height: 100vh;
  padding-top: 150px;
  padding-bottom: 100px;
}
.support-badge {
  opacity: 0.6;
}
.support-headline {
  padding: 10px 0 40px;
}
.support-content {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.support-receipt {
  margin-top: 60px;
  max-width: 640px;
  opacity: 0.6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
code {
  word-break: break-all;
}
</style>
