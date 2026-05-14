import { type Block, formatEther, type Withdrawal } from "viem";
import Big from "big.js";
import SplitText from "gsap/SplitText";
import { gsap } from "gsap";
// import { BLOCKS_HEIGHT } from "~/utils/playground/eth-blocks/eth-blocks-scene";
gsap.registerPlugin(SplitText);

export type BlockLoading = {
  imageId: string;
  loading: boolean;
  blockId: string;
  aniCoef?: number;
};

export type BlockExtended = BlockLoading &
  Block & {
    blockGasTargetPercent?: string;
    blockGasTargetCoef?: number;
    blockGasUsedPercent?: string;
    blockETHBurned?: bigint;
    blockWithdrawalsSum?: bigint;
    blockNetIssuanceETH?: bigint;
    blockHovered?: boolean;
    imageId: string;
    aniCoef?: number;
    loading: boolean;
    blockId: string;
    elRef?: Element | ComponentPublicInstance | null;
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
const imageAmount = 8;

export function generateImageId() {
  const currentIndex = imageIndex;
  imageIndex = (imageIndex + 1) % imageAmount;
  return currentIndex;
}

export function generateLoadingBlockData(blockId: string) {
  return {
    blockHovered: false,
    imageId: generateImageId(),
    loading: true,
    blockId: blockId,
  };
}

export function generateBlockData(
  blockData: Block,
  loadingBlockData: BlockLoading,
) {
  const newBlock: BlockExtended = {
    ...blockData,
    blockHovered: false,
    imageId: loadingBlockData.imageId,
    loading: false,
    blockId: loadingBlockData.blockId,
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
    transactions: [1, 2, 3],
    transactionsRoot: "0xtest",
    uncles: [],
    withdrawals: [{ amount: BigInt(1000000000), recipient: "0xtest" }],
    withdrawalsRoot: "#fff",
  };
}

export function aniProgressBar(
  progressBarBgEls: NodeListOf<Element>,
  progressBarStateEls: NodeListOf<Element>,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  tlNewBlockAniIn.fromTo(
    progressBarBgEls,
    { width: 0 },
    { width: "100%", duration: 0.3, ease: "linear" },
    gsapTimelineDelay,
  );

  if (progressBarStateEls.length) {
    for (let i = 0; i < progressBarStateEls.length; i++) {
      if (!progressBarStateEls[i]) continue;

      const progressStateValue = progressBarStateEls[i].dataset.progressState;
      console.log("progressState", progressBarStateEls[i]);
      tlNewBlockAniIn.fromTo(
        progressBarStateEls[i],
        { width: 0 },
        { width: progressStateValue + "%", duration: 0.3, ease: "linear" },
      );
    }
  }
}

export function aniContentValues(
  elementsToAni: NodeListOf<Element>,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  if (elementsToAni.length) {
    for (let i = 0; i < elementsToAni.length; i++) {
      if (elementsToAni[i]) {
        const splitValues = new SplitText(elementsToAni[i] as HTMLElement, {
          type: "chars",
          linesClass: "content-char",
          reduceWhiteSpace: false,
        });
        tlNewBlockAniIn.fromTo(
          splitValues.chars,
          { opacity: 0, x: 3 },
          { opacity: 1, x: 0, stagger: 0.03, duration: 0.15 },
          gsapTimelineDelay,
        );
      }
    }
  }
}

export function enterAni(tlNewBlockAniIn: gsap.core.Timeline) {
  tlNewBlockAniIn.clear();
  tlNewBlockAniIn.to(".eth-block", {
    width: "423px",
    height: "236px",
    marginTop: "20px",
  });
}

export function aniGasChart(
  gasChartBg: Element | null,
  gasChartValue: Element | null,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  if (!gasChartBg || !gasChartValue) return;
  const gasValue = gasChartValue.getAttribute("stroke-dashoffset") ?? 0;
  console.log("gasValue", gasValue);
  tlNewBlockAniIn.fromTo(
    gasChartBg,
    { strokeDashoffset: 125 },
    { strokeDashoffset: 0, duration: 0.3 },
    gsapTimelineDelay,
  );
  tlNewBlockAniIn.fromTo(
    gasChartValue,
    { strokeDashoffset: 125 },
    { strokeDashoffset: gasValue, duration: 0.3 },
    gsapTimelineDelay,
  );
}

export function aniIcons(
  elementsToAni: NodeListOf<Element>,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  tlNewBlockAniIn.fromTo(
    elementsToAni,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 0.3,
    },
    gsapTimelineDelay,
  );
}

export function blockContentAniIn(
  el: Element,
  tlNewBlockAniIn: gsap.core.Timeline,
) {
  const gasChartBg = el.querySelector("#gas-chart-bg");
  const gasChartValue = el.querySelector("#gas-chart-value");
  aniGasChart(gasChartBg, gasChartValue, tlNewBlockAniIn, "<+0.5");

  const iconEls = el.querySelectorAll(".ani-index-icon");
  aniIcons(iconEls, tlNewBlockAniIn);

  const valuesElementsIndex0 = el.querySelectorAll(".ani-index-0");
  aniContentValues(valuesElementsIndex0, tlNewBlockAniIn, "<");

  const valuesElementsIndex1 = el.querySelectorAll(".ani-index-1");
  aniContentValues(valuesElementsIndex1, tlNewBlockAniIn, "<");

  const valuesElementsIndexTitle = el.querySelectorAll(".ani-index-title");
  aniContentValues(valuesElementsIndexTitle, tlNewBlockAniIn, "<");

  const progressBarBgEls = el.querySelectorAll(".progress-bar .progress-bg");
  const progressBarStateEls = el.querySelectorAll(".progress-bar .progress-state");
  aniProgressBar(progressBarBgEls, progressBarStateEls, tlNewBlockAniIn, "<");
}
