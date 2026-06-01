import type { BlockItem } from "#shared/types/playground/eth-blocks";

export const useEthBlocks = () => {
  const ethBlocks = useState<Map<number, BlockItem>>(
    "ethBlocks",
    () => new Map(),
  );
  const blockIdCounter = useState<number>("ethBlocksIdCounter", () => 0);
  const blockImageIdCounter = useState<number>(
    "ethBlockImageIdCounter",
    () => 0,
  );

  return {
    ethBlocks,
    blockIdCounter,
    blockImageIdCounter,
  };
};
