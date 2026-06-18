import SplitText from "gsap/SplitText";
import { gsap } from "gsap";
import { ethBlocksAnimation } from "~/utils/playground/eth-blocks/eth-blocks-scene";
// import { ethBlocksAnimation } from "~/utils/playground/eth-blocks/eth-blocks-scene";

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
      const progressStateValue = progressBarStateEl.dataset.progressState ?? 50;
      tlNewBlockAniIn.fromTo(
        progressBarStateEl,
        { width: 0 },
        { width: progressStateValue + "%", duration: 0.3, ease: "linear" },
        "<+0.15",
      );
    }
  }
}

export function aniContentValuesCounter(
  blockEl: Element,
  classSelector: string,
  tlNewBlockAniIn: gsap.core.Timeline,
  gsapTimelineDelay?: string,
) {
  const elementsToAni = blockEl.querySelectorAll(classSelector);

  if (elementsToAni.length) {
    for (let i = 0; i < elementsToAni.length; i++) {
      const content = elementsToAni[i] as HTMLElement;
      if (elementsToAni[i] && content) {
        tlNewBlockAniIn.fromTo(
          content,
          { opacity: 0 },
          { opacity: 1, duration: 0.15 },
          "<",
        );
        tlNewBlockAniIn.from(
          content,
          {
            innerText: 0,
            duration: 0.75,
            snap: {
              innerText: 1,
            },
          },
          gsapTimelineDelay,
        );
      }
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

export async function enterAni(
  tlEnterBlockAniIn: gsap.core.Timeline,
  ethBlockEls: HTMLCollection | null,
  isMobile: boolean,
) {
  if (!ethBlockEls) return;
  return new Promise((resolve) => {
    // tlEnterBlockAniIn.play();
    for (let i = 0; i < ethBlockEls.length; i++) {
      const ethBlock = ethBlockEls[i];
      if (ethBlock) {
        tlEnterBlockAniIn.to(ethBlock, {
          opacity: 1,
          duration: 0.1,
        });
        tlEnterBlockAniIn.to(
          ethBlock,
          {
            width: "100%",
            height: "236px",
            marginTop: isMobile ? "10px" : "20px",
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              if (i === 1) {
                resolve(true);
              }
            },
            onStart: () => {
              if (i === 0) {
                ethBlocksAnimation.revealFirstTexture();
              }
            },
          },
          "<",
        );
        if (i === 0) {
          blockContentAniIn(ethBlock, tlEnterBlockAniIn, true);
        }
      }
    }
    // tlNewBlockAniIn.play();
  });
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
  aniPositionImmediate: boolean = false,
) {
  const firstAniPosition = aniPositionImmediate ? "<" : "<+0.35";
  const aniPositionDelayed = aniPositionImmediate ? "<" : "<+0.15";
  aniContentValues(
    blockEl,
    ".ani-index-title",
    tlNewBlockAniIn,
    firstAniPosition,
  );
  aniIcons(blockEl, tlNewBlockAniIn, "<");
  aniContentValuesCounter(
    blockEl,
    ".ani-index-0-counter",
    tlNewBlockAniIn,
    aniPositionDelayed,
  );
  aniContentValues(
    blockEl,
    ".ani-index-0",
    tlNewBlockAniIn,
    aniPositionDelayed,
  );
  aniContentValues(
    blockEl,
    ".ani-index-1",
    tlNewBlockAniIn,
    aniPositionDelayed,
  );
  aniProgressBar(blockEl, tlNewBlockAniIn, aniPositionDelayed);
  aniGasChart(blockEl, tlNewBlockAniIn, "<");
}

export function credentialsAniIn(tl: gsap.core.Timeline) {
  const blockEl = document.querySelector("#credentials") as HTMLElement;
  if (!blockEl) return;
  blockEl.style.opacity = "0.7";
  const aniPositionDelayed = "<";
  aniContentValues(blockEl, ".cred-name", tl, aniPositionDelayed);
  aniContentValues(blockEl, "#credentials .cred-link", tl, "<+0.15");
}
