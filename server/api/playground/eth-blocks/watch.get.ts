import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export default defineEventHandler(async (event) => {
  const { alchemyToken } = useRuntimeConfig(event);
  const client = createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyToken}`),
  });

  const eventStream = createEventStream(event);

  const unwatch = client.watchBlocks({
    onBlock: async (block) => {
      await eventStream.push(
        JSON.stringify(
          block,
          (_, v) => (typeof v === "bigint" ? v.toString() : v), // BigInt is not JSON-serializable
        ),
      );
    },
  });

  eventStream.onClosed(() => {
    unwatch();
  });

  return eventStream.send();
});
