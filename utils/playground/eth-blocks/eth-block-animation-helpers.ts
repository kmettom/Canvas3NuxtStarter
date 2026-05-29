import SplitText from "gsap/SplitText";
import { gsap } from "gsap";
gsap.registerPlugin(SplitText);

//*********************************
// ANIMATIONS
//*********************************

export function aniProgressBar(
  blockEl: Element,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  const progressBarBgEls = blockEl.querySelectorAll(
    ".progress-bar .progress-bg",
  );
  const progressBarStateEls = blockEl.querySelectorAll<HTMLElement>(
    ".progress-bar .progress-state",
  );

  tlNewBlockAniIn.fromTo(
    progressBarBgEls,
    { width: 0 },
    { width: "100%", duration: 0.3, ease: "linear" },
    gsapTimelineDelay,
  );

  if (progressBarStateEls.length) {
    for (let i = 0; i < progressBarStateEls.length; i++) {
      const progressBarStateEl = progressBarStateEls[i];
      if (!progressBarStateEl) continue;
      const progressStateValue = progressBarStateEl.dataset.progressState;
      tlNewBlockAniIn.fromTo(
        progressBarStateEl,
        { width: 0 },
        { width: progressStateValue + "%", duration: 0.3, ease: "linear" },
        "<+0.15",
      );
    }
  }
}

export function aniContentValues(
  blockEl: Element,
  classSelector: string,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  const elementsToAni = blockEl.querySelectorAll(classSelector);

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
          i === 0 ? gsapTimelineDelay : "<",
        );
      }
    }
  }
}

export function enterAni(
  tlNewBlockAniIn: gsap.core.Timeline,
  ethBlocks: HTMLElement | null,
) {
  if (!ethBlocks) return;
  const blocks = ethBlocks.querySelectorAll(".eth-block");
  // console.log("blocks", blocks);
  // return new Promise((resolve) => {
  // tlNewBlockAniIn.play();
  tlNewBlockAniIn.to(blocks, {
    opacity: 1,
    duration: 0.1,
  });
  tlNewBlockAniIn.to(blocks, {
    width: "423px",
    height: "236px",
    marginTop: "20px",
    stagger: 0.2,
    onComplete: () => {
      // console.log("2 enter ani");
      // resolve(true);
    },
  });
  // });
}

export function aniGasChart(
  blockEl: Element,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  const gasChartBg = blockEl.querySelector("#gas-chart-bg");
  const gasChartValue = blockEl.querySelector("#gas-chart-value");
  if (!gasChartBg || !gasChartValue) return;
  const gasValue = gasChartValue.getAttribute("stroke-dashoffset") ?? 0;
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
  blockEl: Element,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  const elementsToAni = blockEl.querySelectorAll(".ani-index-icon");

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
  blockEl: Element,
  tlNewBlockAniIn: gsap.core.Timeline,
) {
  aniContentValues(blockEl, ".ani-index-title", tlNewBlockAniIn, "<+0.3");
  aniIcons(blockEl, tlNewBlockAniIn, "<");
  aniContentValues(blockEl, ".ani-index-0", tlNewBlockAniIn, "<");
  aniContentValues(blockEl, ".ani-index-1", tlNewBlockAniIn, "<");
  aniProgressBar(blockEl, tlNewBlockAniIn, "<+0.1");
  aniGasChart(blockEl, tlNewBlockAniIn, "<");
}
