import { hexToNumber } from "viem";

export const blockWithdrawalsSum = (withdrawals) => {
  let sum = 0;
  for (let i = 0; i < withdrawals.length; i++) {
    const withNum = hexToNumber(withdrawals[i].amount);
    sum += withNum;
  }
  return sum;
};

export const blockETHBurned = (baseFeePerGas, gasUsed) => {
  const baseFeePerGasNum = hexToNumber(baseFeePerGas);
  const gasUsedNum = hexToNumber(gasUsed);

  return baseFeePerGasNum * gasUsedNum;
};

export const blockGasUsedPercent = (gasLimit, gasUsed) => {
  const gasUsedNum = hexToNumber(gasUsed);
  const gasLimitNum = hexToNumber(gasLimit);

  return Number((gasUsedNum / gasLimitNum) * 100).toFixed(2) + "%";
};

export const blockGasTargetPercent = (gasLimit, gasUsed) => {
  const gasUsedNum = hexToNumber(gasUsed);
  const gasLimitNum = hexToNumber(gasLimit);
  const gasTargetZeroPoint = gasLimitNum / 2;
  const gasTargetCoef = (gasUsedNum - gasTargetZeroPoint) / gasTargetZeroPoint;

  return Number(gasTargetCoef * 100).toFixed(2) + "%";
};
