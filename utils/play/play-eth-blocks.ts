import type { Block, Withdrawal } from "viem";
import Big from "big.js";

export type BlockExtended = Block & {
  blockGasTargetPercent?: string;
  blockGasUsedPercent?: string;
  blockETHBurned?: string | number;
  blockWithdrawalsSum?: string | number;
  blockNetIssuanceETH?: string | number;
};

export const blockWithdrawalsSum = (withdrawals: Withdrawal[]) => {
  let sum = 0n;

  for (let i = 0; i < withdrawals.length; i++) {
    const w = withdrawals[i];
    if (w) {
      sum += BigInt(w.amount);
    }
  }
  return sum;
};

export const blockETHBurned = (
  baseFeePerGas: bigint | null,
  gasUsed: bigint,
): bigint => {
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
  if (gasLimit === 0n) return "0.00%";

  const limit = new Big(gasLimit.toString());
  const used = new Big(gasUsed.toString());

  const target = limit.div(2);

  return used.minus(target).div(target).times(100).toFixed(2) + "%";
};

export const generateBlockData = (blockData: Block) => {
  const newBlock: BlockExtended = { ...blockData };
  newBlock.blockGasUsedPercent = blockGasUsedPercent(
    newBlock.gasLimit,
    newBlock.gasUsed,
  );
  newBlock.blockGasTargetPercent = blockGasTargetPercent(
    newBlock.gasLimit,
    newBlock.gasUsed,
  );
  const blockWithdrawalsSumVal = blockWithdrawalsSum(
    newBlock.withdrawals ?? [],
  );
  newBlock.blockWithdrawalsSum = blockWithdrawalsSumVal.toString();
  const blockETHBurnedVal = blockETHBurned(
    newBlock.baseFeePerGas,
    newBlock.gasUsed,
  );
  newBlock.blockETHBurned = blockETHBurnedVal.toString();
  newBlock.blockNetIssuanceETH = (
    blockWithdrawalsSumVal - blockETHBurnedVal
  ).toString();
  return newBlock;
};
