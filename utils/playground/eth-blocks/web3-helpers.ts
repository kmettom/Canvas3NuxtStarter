import { type Block, formatEther, type Withdrawal } from "viem";
import Big from "big.js";
import type { BlockItem } from "#shared/types/playground/eth-blocks";
import { IMAGE_FILE_AMOUNT } from "~/constants/playground/eth-blocks";

const GWEI_TO_WEI = 1_000_000_000n;

export const blockWithdrawalsSumWei = (withdrawals: Withdrawal[]) => {
  let sumGwei = 0n;
  for (const w of withdrawals) sumGwei += BigInt(w.amount);
  return sumGwei * GWEI_TO_WEI;
};

export const blockETHBurnedWei = (
  baseFeePerGas: bigint | null,
  gasUsed: bigint,
) => {
  if (!baseFeePerGas) return 0n;
  return baseFeePerGas * gasUsed;
};

export const blockGasUsedPercent = (
  gasLimit: bigint,
  gasUsed: bigint,
): string => {
  if (gasLimit === 0n) return "0.00%";

  const used = new Big(gasUsed.toString());
  const limit = new Big(gasLimit.toString());

  return used.div(limit).times(100).toFixed(2);
};

export const blockGasTargetPercent = (
  gasLimit: bigint,
  gasUsed: bigint,
): string => {
  if (gasLimit === 0n) return "0.00";

  const limit = new Big(gasLimit.toString());
  const used = new Big(gasUsed.toString());

  const target = limit.div(2);

  return used.minus(target).div(target).times(100).toFixed(2);
};

let imageIndex = 0;
const imageAmount = IMAGE_FILE_AMOUNT;
export function generateImageId() {
  const currentIndex = imageIndex;
  imageIndex++;
  if (imageIndex === imageAmount) imageIndex = 0;
  return currentIndex.toString();
}

export function generateLoadingBlockData(blockId: string) {
  return {
    blockHovered: false,
    imageId: generateImageId(),
    loading: true,
    blockId: blockId,
    kind: "loading",
  };
}

export function generateBlockData(blockId: string, blockData: Block) {
  const newBlock: BlockItem = {
    ...blockData,
    blockHovered: false,
    imageId: generateImageId(),
    loading: false,
    blockId: blockId,
    kind: "full",
  };

  newBlock.blockGasUsedPercent = blockGasUsedPercent(
    newBlock.gasLimit,
    newBlock.gasUsed,
  );

  const blockGasTarget = blockGasTargetPercent(
    newBlock.gasLimit,
    newBlock.gasUsed,
  );

  newBlock.blockGasTargetCoef = (Number(blockGasTarget) + 100) / 200;
  newBlock.blockGasTargetPercent = blockGasTarget + "%";

  const withdrawalsWei = blockWithdrawalsSumWei(newBlock.withdrawals ?? []);
  const burnedWei = blockETHBurnedWei(newBlock.baseFeePerGas, newBlock.gasUsed);

  newBlock.blockWithdrawalsSum = withdrawalsWei;
  newBlock.blockETHBurned = burnedWei;
  newBlock.blockNetIssuanceETH = withdrawalsWei - burnedWei;

  return newBlock;
}

export const formatEth2 = (wei: bigint) => {
  const numString = formatEther(wei).toString();
  let nonZeroIndex = 0;
  for (let i = 0; i < numString.length; i++) {
    if (numString[i] !== "0" && numString[i] !== "." && numString[i] !== "-") {
      nonZeroIndex = numString.includes("-") ? i - 1 : i;
      break;
    }
  }
  return Number(numString).toFixed(nonZeroIndex);
};

export const deserializeBlock = (block: any): Block => ({
  ...block,
  number: block.number != null ? BigInt(block.number) : null,
  timestamp: BigInt(block.timestamp),
  gasLimit: BigInt(block.gasLimit),
  gasUsed: BigInt(block.gasUsed),
  baseFeePerGas:
    block.baseFeePerGas != null ? BigInt(block.baseFeePerGas) : null,
  difficulty: BigInt(block.difficulty),
  totalDifficulty:
    block.totalDifficulty != null ? BigInt(block.totalDifficulty) : null,
  size: BigInt(block.size),
  withdrawals: block.withdrawals?.map((w: any) => ({
    ...w,
    amount: BigInt(w.amount),
  })),
});

//********************
// for local dev with no connection
//********************

export function generateMockBlockData() {
  return {
    baseFeePerGas: BigInt(1),
    blobGasUsed: BigInt(1),
    difficulty: BigInt(1),
    excessBlobGas: BigInt(1),
    extraData: "0xtest",
    gasLimit: BigInt(2500000000000000000),
    gasUsed: BigInt(800000000000000000),
    hash: "0xtest",
    logsBloom: "0xtest",
    miner: "xxxAddress",
    mixHash: "0xtest",
    nonce: "0xtest",
    number: BigInt(1),
    parentBeaconBlockRoot: "0xtest",
    parentHash: "0xtest",
    receiptsRoot: "0xtest",
    sealFields: [],
    sha3Uncles: "0xtest",
    size: BigInt(1),
    stateRoot: "0xtest",
    timestamp: BigInt(1),
    totalDifficulty: BigInt(1),
    transactions: [
      1, 2, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 33, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    ],
    transactionsRoot: "0xtest",
    uncles: [],
    withdrawals: [{ amount: BigInt(1000000000), recipient: "0xtest" }],
    withdrawalsRoot: "#fff",
  };
}
