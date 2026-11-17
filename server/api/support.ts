// Paid route — protected by the x402-nuxt middleware (see `x402.routes` in nuxt.config.ts).
// The handler only runs after the payment has been verified and settled.
export default defineEventHandler((event) => {
  const payment = event.context.x402;

  return {
    payer: payment?.payer,
    txHash: payment?.txHash,
    networkName: payment?.networkName,
    amountFormatted: payment?.amountFormatted,
    explorerTxUrl: payment?.explorerTxUrl,
    content: {
      title: "Thank you for supporting Canvas3",
      paragraphs: [
        "This content is only delivered after a successful x402 payment.",
        "Placeholder — replace with the real support content.",
      ],
    },
  };
});
