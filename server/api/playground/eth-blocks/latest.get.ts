// import { createPublicClient, http } from "viem";
// import { mainnet } from "viem/chains";
// import type { Address } from "abitype";
// import {BLOCKS_ON_SCREEN_AMOUNT} from "~/utils/playground/eth-blocks/eth-blocks-scene";

// export const AMOUNT_OF_BLOCKS = BLOCKS_ON_SCREEN_AMOUNT;

import { generateMockBlockData } from "~/utils/playground/eth-blocks/web3-helpers";

export default defineEventHandler(async (event) => {
  //**************************
  // TODO: LOCAL DEV NO CONNECTION START
  //**************************

  console.log("event", event);
  const mockBlocks = [
    generateMockBlockData(),
    generateMockBlockData(),
    generateMockBlockData(),
    generateMockBlockData(),
    generateMockBlockData(),
  ];
  console.log("mock blocks", mockBlocks);
  return JSON.parse(
    JSON.stringify(mockBlocks, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );

  //**************************
  // TODO: LOCAL DEV NO CONNECTION END
  //**************************

  // const { alchemyToken } = useRuntimeConfig(event);
  // const client = createPublicClient({
  //   chain: mainnet,
  //   transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyToken}`),
  // });
  //
  // const latestBlockNumber = await client.getBlockNumber();
  // const blockNumbers = Array.from(
  //   { length: AMOUNT_OF_BLOCKS },
  //   (_, i) => latestBlockNumber - BigInt(i),
  // );
  //
  // const blocks = await Promise.all(
  //   blockNumbers.map((n) => client.getBlock({ blockNumber: n })),
  // );
  //
  // return JSON.parse(
  //   JSON.stringify(blocks, (_, v) =>
  //     typeof v === "bigint" ? v.toString() : v,
  //   ),
  // );
});
