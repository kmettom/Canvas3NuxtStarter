import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
// import {BLOCKS_ON_SCREEN_AMOUNT} from "~/utils/playground/eth-blocks/eth-blocks-scene";

// export const AMOUNT_OF_BLOCKS = BLOCKS_ON_SCREEN_AMOUNT;
export const AMOUNT_OF_BLOCKS = 3;

export default defineEventHandler(async (event) => {
  const { alchemyToken } = useRuntimeConfig(event);
  const client = createPublicClient({
    chain: mainnet,
    transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyToken}`),
  });

  const latestBlockNumber = await client.getBlockNumber();
  const blockNumbers = Array.from(
    { length: AMOUNT_OF_BLOCKS },
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
