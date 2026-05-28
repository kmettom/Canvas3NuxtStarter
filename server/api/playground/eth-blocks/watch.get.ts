import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
// import { generateMockBlockData } from "~/utils/playground/eth-blocks/web3-helpers";

export default defineEventHandler(async (event) => {
  //**************************
  // TODO: LOCAL DEV NO CONNECTION START
  //**************************
  // const eventStream = createEventStream(event);
  //
  // const mockBlock = generateMockBlockData();
  //
  // setInterval(() => {
  //   eventStream.push(
  //     JSON.stringify(
  //       mockBlock,
  //       (_, v) => (typeof v === "bigint" ? v.toString() : v), // BigInt is not JSON-serializable
  //     ),
  //   );
  // }, 5033);
  //
  // return eventStream.send();

  //**************************
  // TODO: LOCAL DEV NO CONNECTION END
  //**************************

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
