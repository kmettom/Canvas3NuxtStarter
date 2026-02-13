import { type Block, formatEther, type Withdrawal } from "viem";
import Big from "big.js";

export type BlockExtended = Block & {
  blockGasTargetPercent?: string;
  blockGasTargetCoef?: number;
  blockGasUsedPercent?: string;
  blockETHBurned?: bigint;
  blockWithdrawalsSum?: bigint;
  blockNetIssuanceETH?: bigint;
  blockAniIn: boolean;
  blockHovered: boolean;
};

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

  return used.div(limit).times(100).toFixed(2) + "%";
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

export const generateBlockData = (blockData: Block) => {
  const newBlock: BlockExtended = {
    ...blockData,
    blockAniIn: false,
    blockHovered: false,
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
};

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
