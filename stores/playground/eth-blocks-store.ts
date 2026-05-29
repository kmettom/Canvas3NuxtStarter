import type { BlockItem } from "#shared/types/playground/eth-blocks";

export const useEthBlocks = () => {
  // const ethBlocks = useState<BlockItem[]>('ethBlocks', () => [])
  const ethBlocks = useState<Map<string, BlockItem>>(
    "ethBlocks",
    () => new Map(),
  );
  return {
    ethBlocks,
  };
};
