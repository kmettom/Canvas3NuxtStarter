export interface SupportAccess {
  payer?: string;
  txHash?: string;
  networkName?: string;
  amountFormatted?: string;
  explorerTxUrl?: string;
  content: { title: string; paragraphs: string[] };
}

type SupportQuote = Awaited<
  ReturnType<ReturnType<typeof useX402Payment>["quote"]>
>;

const SUPPORT_API = "/api/support";

/** Paid /api/support response, kept in state so /support/content can render it after the redirect. */
export function useSupportAccess() {
  const access = useState<SupportAccess | null>("support:access", () => null);
  const price = useState<SupportQuote>("support:price", () => null);
  const { pay, quote, isPaying, error } = useX402Payment();

  /** Loads price and network from the 402 challenge, so the paywall can show them before paying. */
  async function loadPrice() {
    price.value = await quote(SUPPORT_API).catch(() => null);
  }

  /** Pays for /api/support and redirects to /support/content. Returns an error message on failure. */
  async function unlock(): Promise<string | null> {
    try {
      // Fetches the route; on 402 it signs the payment in MetaMask and retries
      const response = await pay(SUPPORT_API);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        return `Error: ${response.status} ${body?.message ?? response.statusText}`;
      }
      access.value = await response.json();
      await navigateTo("/support/content");
      return null;
    } catch (err: unknown) {
      return `Payment error: ${err instanceof Error ? err.message : "Unknown error"}`;
    }
  }

  return { access, price, isPaying, error, loadPrice, unlock };
}
