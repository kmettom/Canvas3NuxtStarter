import type { BlockItem } from "#shared/types/playground/eth-blocks";

export const useEthBlocks = () => {
  const ethBlocks = useState<Map<number, BlockItem>>(
    "ethBlocks",
    () => new Map(),
  );
  return {
    ethBlocks,
  };
};
