import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const NUM_LAST_BLOCKS = 1;

export default defineEventHandler(async (event) => {
  const { alchemyToken } = useRuntimeConfig(event);
  const client = createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyToken}`),
  });

  const latestBlockNumber = await client.getBlockNumber();
  const blockNumbers = Array.from(
    { length: NUM_LAST_BLOCKS },
    (_, i) => latestBlockNumber - BigInt(i),
  );

  const blocks = await Promise.all(
    blockNumbers.map((n) => client.getBlock({ blockNumber: n })),
  );

  return JSON.parse(
    JSON.stringify(blocks, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );
});
