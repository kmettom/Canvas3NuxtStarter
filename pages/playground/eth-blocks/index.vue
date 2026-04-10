<template>
  <div class="eth-blocks-page page-container eth-base-text">
    <div
      id="ethBGWrapper"
      v-action-on-scroll="{
        activeRange: 0.9,
        fixToParent: {
          containerId: 'ethBGWrapper',
          fixPosition: 0,
          margin: 0,
        },
      }"
      class="eth-bg-wrapper"
    >
      <div class="eth-bg-image-holder">
        <img
          ref="imgHtmlEl"
          :src="`/images/${activeBlock?.imageId ?? '01'}.jpg`"
          alt=""
          class="eth-bg-image"
        />
      </div>
    </div>
    <!--    <div class="block-in-progress-wrapper">-->
    <!--      <div class="block-in-progress-loader" />-->
    <!--    </div>-->

    <div class="eth-blocks">
      <div
        v-for="block in blocksToRender"
        :key="block.timestamp.toString()"
        :ref="(el) => animateNewBlockAdded(el, block.timestamp.toString())"
        v-action-on-scroll="{
          activeRange: 0.9,
          onScrollCallback: (el, scrollSpeed, scrollPosition) => {
            const windowHeight = 1200;
            const basePosition = 250;
            const blockClientRect = el.elNode.getBoundingClientRect();
            const blockPositionTop = blockClientRect.top;
            const aniCoef = Math.abs(
              (blockPositionTop - basePosition) / windowHeight,
            );

            gsap.to(el.elNode, {
              duration: 0,
              ease: 'linear',
              scale: 1 - aniCoef / 2,
              opacity: 1 - aniCoef * 3,
            });
            if (aniCoef > 0.06) {
              block.aniCoef = aniCoef;
              if (
                !activeBlock ||
                (block.aniCoef > activeBlock.aniCoef &&
                  activeBlock.timestamp.toString() !==
                    block.timestamp.toString())
              ) {
                activeBlock = block;
                ethBlocksAnimation.imageChange(imgHtmlEl);
              }
            }
            ethBlocksAnimation.glassBlockPositionsUpdate(
              block.timestamp.toString(),
              blockClientRect,
            );
          },
        }"
        class="eth-block"
        @mouseenter="hoverBlock($event, true, block.timestamp.toString())"
        @mouseleave="hoverBlock($event, false, block.timestamp.toString())"
      >
        <div class="content-wrapper">
          <div class="content-row">
            <!--            <div >-->
            <div class="content-block">
              <div class="content-title">Transactions:</div>
              <div class="content-value ani-index-0 eth-large-text">
                {{ block.transactions.length }}
              </div>
              imageId:{{ block.imageId }}
            </div>
            <div class="content-block">
              <div class="content-title gas">Gas:</div>
              <div class="gas-block">
                <div class="gas-chart">
                  <svg
                    width="46"
                    height="46"
                    viewBox="0 0 46 46"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <!-- Static background ring (the 0.2 opacity path) -->
                    <circle
                      cx="23"
                      cy="23"
                      r="19.327"
                      stroke="white"
                      stroke-opacity="0.2"
                      stroke-width="6"
                      fill="none"
                    />

                    <!-- Progress ring — animate stroke-dashoffset with GSAP -->
                    <circle
                      id="progress-ring"
                      cx="23"
                      cy="23"
                      r="19.327"
                      stroke="white"
                      stroke-width="6"
                      fill="none"
                      stroke-linecap="butt"
                      stroke-dasharray="102.6"
                      stroke-dashoffset="50"
                      transform="rotate(-90 23 23)"
                    />
                  </svg>
                </div>
                <div class="gas-stats">
                  <div class="gas-stat-line">
                    Gas used: {{ block.blockGasUsedPercent }}
                  </div>
                  <div class="">
                    Gas target: {{ block.blockGasTargetPercent }}
                  </div>
                </div>
              </div>
            </div>
            <!--            </div>-->
          </div>
          <div class="content-row row-wrap">
            <!--            <div>-->
            <div v-if="block.blockETHBurned" class="content-block supply">
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12.2549 9.40007C12.2549 5.87178 10.5994 3.73517 9.89844 2.98894C9.7689 3.127 9.60547 3.31269 9.42676 3.54655C9.17597 3.87622 8.67292 3.86902 8.43164 3.52605C7.52645 2.23576 6.54846 1.38142 6.10156 1.02214C5.08691 1.70036 4.16691 2.51137 3.36719 3.43425C2.09844 4.901 0.942383 6.91915 0.942383 9.40105C0.942496 10.1436 1.08882 10.8791 1.37305 11.5651C1.65706 12.2514 2.0736 12.8757 2.59863 13.401C2.80124 13.6035 3.01923 13.7889 3.24902 13.9577C3.00347 13.4821 2.85984 12.9566 2.83301 12.4147L2.82812 12.2282L2.83691 11.9596C2.92295 10.6261 3.63404 9.43697 4.35254 8.55144C4.90845 7.8748 5.53884 7.26282 6.23242 6.72819C6.33752 6.64808 6.46648 6.60515 6.59863 6.60515C6.69784 6.60515 6.7951 6.62937 6.88184 6.67546L6.96484 6.72819L7.21777 6.93034C7.80293 7.40805 8.34064 7.94148 8.82227 8.52409C9.58265 9.45313 10.3392 10.7215 10.3682 12.1432L10.3691 12.2282C10.3691 12.8359 10.221 13.4276 9.94727 13.9577C10.1773 13.7888 10.3958 13.6037 10.5986 13.401L11.2637 14.0671C10.6512 14.6795 9.92416 15.1652 9.12402 15.4967C8.32339 15.8284 7.46525 15.9997 6.59863 15.9997C5.73201 15.9997 4.87387 15.8284 4.07324 15.4967C3.27276 15.1653 2.54535 14.6796 1.93262 14.0671C1.32019 13.4546 0.834527 12.7265 0.50293 11.9264C0.17126 11.1258 3.85031e-05 10.2676 0 9.40105C0 6.61267 1.2997 4.38372 2.6543 2.81608C4.00854 1.24889 5.44694 0.311345 5.80371 0.0895221L5.88379 0.0475299C5.96649 0.012191 6.05661 -0.0035091 6.14746 0.000654923C6.23808 0.0048529 6.32606 0.02932 6.40527 0.071944L6.48145 0.120772L6.88379 0.441085C7.37369 0.853501 8.1675 1.59581 8.94922 2.6364C9.11919 2.43637 9.29921 2.2445 9.48926 2.06315L9.57812 1.99382C9.6727 1.93392 9.78302 1.90124 9.89648 1.90105C10.048 1.90087 10.194 1.95878 10.3047 2.06218C10.8288 2.55047 13.1973 4.99786 13.1973 9.40007C13.1973 10.2673 13.0261 11.1252 12.6943 11.9264C12.3628 12.7269 11.8772 13.4544 11.2646 14.0671L10.5986 13.401C11.1237 12.8757 11.5402 12.2514 11.8242 11.5651C12.1086 10.8788 12.2549 10.143 12.2549 9.40007ZM3.78418 12.5075C3.84843 13.1549 4.13454 13.7641 4.59863 14.2282C5.12898 14.7585 5.84863 15.0563 6.59863 15.0563C7.34864 15.0563 8.06829 14.7585 8.59863 14.2282C9.12896 13.6979 9.42673 12.9782 9.42676 12.2282L9.42578 12.1637L9.41504 11.9567C9.32788 10.9221 8.75818 9.93378 8.0918 9.1198C7.53328 8.4367 6.937 7.91584 6.59863 7.64128C6.25618 7.91933 5.64933 8.44997 5.08496 9.14519C4.36948 10.0266 3.77051 11.1064 3.77051 12.2282L3.78418 12.5075Z"
                  fill="white"
                />
              </svg>
              <span class="">Burned:</span>
              <span class="content-value ani-index-0">
                {{ formatEth2(block.blockETHBurned) }}
              </span>
              <span class="content-value ani-index-1">ETH</span>
              <progressBar :progress-percent="20" />
            </div>
            <div v-if="block.blockWithdrawalsSum" class="content-block supply">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_58_158)">
                  <path
                    d="M14.9991 3.49961C14.9991 3.82787 14.818 4.15291 14.4663 4.45619C14.1145 4.75946 13.599 5.03502 12.9491 5.26714C12.2991 5.49925 11.5276 5.68338 10.6784 5.809C9.82924 5.93462 8.91911 5.99927 7.99998 5.99927C6.14371 5.99927 4.36347 5.73592 3.05089 5.26714C1.73832 4.79836 1.00092 4.16256 1.00092 3.49961C1.00092 3.17134 1.18195 2.8463 1.53369 2.54302C1.88542 2.23975 2.40097 1.96419 3.05089 1.73207C3.70082 1.49996 4.47239 1.31583 5.32156 1.19021C6.17072 1.06459 7.08085 0.999939 7.99998 0.999939C8.91911 0.999939 9.82924 1.06459 10.6784 1.19021C11.5276 1.31583 12.2991 1.49996 12.9491 1.73207C13.599 1.96419 14.1145 2.23975 14.4663 2.54302C14.818 2.8463 14.9991 3.17134 14.9991 3.49961Z"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14.9991 12.4984C14.9991 12.9372 14.6756 13.3682 14.0614 13.7482C13.4471 14.1282 12.5635 14.4438 11.4995 14.6632C10.4355 14.8826 9.22858 14.9981 7.99998 14.9981C6.77139 14.9981 5.56444 14.8826 4.50045 14.6632C3.43646 14.4438 2.55291 14.1282 1.93861 13.7482C1.32432 13.3682 1.00092 12.9372 1.00092 12.4984"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14.9991 9.49878C14.9991 9.93756 14.6756 10.3686 14.0614 10.7486C13.4471 11.1286 12.5635 11.4442 11.4995 11.6636C10.4355 11.8829 9.22858 11.9984 7.99998 11.9984C6.77139 11.9984 5.56444 11.8829 4.50045 11.6636C3.43646 11.4442 2.55291 11.1286 1.93861 10.7486C1.32432 10.3686 1.00092 9.93756 1.00092 9.49878"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14.9991 6.49921C14.9991 6.93799 14.6756 7.36904 14.0614 7.74904C13.4471 8.12904 12.5635 8.44459 11.4995 8.66398C10.4355 8.88337 9.22858 8.99887 7.99998 8.99887C6.77139 8.99887 5.56444 8.88337 4.50045 8.66398C3.43646 8.44459 2.55291 8.12904 1.93861 7.74904C1.32432 7.36904 1.00092 6.93799 1.00092 6.49921"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M1.00092 3.49963V12.4984"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14.999 3.49963V12.4984"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_58_158">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              <span class="content-title">Withdrawed:</span>
              <span class="content-value ani-index-0">
                {{ formatEth2(block.blockWithdrawalsSum) }}
              </span>
              <span class="content-value ani-index-1">ETH</span>
              <progressBar :progress-percent="20" />
            </div>
            <div v-if="block.blockNetIssuanceETH" class="content-block supply">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_58_172)">
                  <path
                    d="M8 2L14.9282 14H1.0718L8 2Z"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_58_172">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span class="content-title">Supply Delta:</span>
              <span class="content-value ani-index-0 text-bold">
                {{ formatEth2(block.blockNetIssuanceETH) }}
              </span>
              <span class="content-value ani-index-1 text-bold">ETH</span>
              <!--              <progressBar :progressPercent="20" />-->
            </div>
          </div>
        </div>
      </div>
      <!--      </div>-->
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import {
  formatEth2,
  generateBlockData,
  type BlockExtended,
  deserializeBlock,
} from "~/utils/playground/eth-blocks/web3-helpers";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
import ProgressBar from "~/components/playground/eth-blocks/progressBar.vue";
import {
  ethBlocksAnimation,
  // type Vec4Position,
} from "~/utils/playground/eth-blocks/eth-blocks-scene";

gsap.registerPlugin(SplitText);

const maxBlocks = 10;
const activeBlock = ref<BlockExtended | null>(null);

const blocksToRender = computed<BlockExtended[]>(() => {
  return [...blocks.value.values()].sort((a, b) =>
    a.timestamp > b.timestamp ? -1 : 1,
  );
});

const hoverBlock = (event: Event, status: boolean, blockTimestamp: string) => {
  // const target = event.target as Element;
  // const titles = target.querySelectorAll(".content-title");
  // if (titles.length < 1) return;
  const tl = gsap.timeline({});
  // tl.to(titles, { opacity: status ? 1 : 0 });

  tl.call(
    () => {
      const blockToAnimate = blocks.value.get(blockTimestamp);
      if (blockToAnimate) {
        blockToAnimate.blockHovered = status;
      }
    },
    undefined,
    "<",
  );
};

const blocks = ref<Map<string, BlockExtended>>(new Map());
// const defaultBlockTimeAverage = 15;
// const averageBlockTime = ref(defaultBlockTimeAverage);

// const tlInProgress = gsap.timeline({
//   onStart: () => {
//     Canvas3.setMeshPositionsUpdate(true);
//   },
//   onComplete: () => {
//     Canvas3.setMeshPositionsUpdate(false);
//   },
// });

// const animateNewBlockInProgress = () => {
//   tlInProgress.clear();
//   tlInProgress.fromTo(
//     ".block-in-progress-loader",
//     { width: 0 },
//     { width: "100%", duration: averageBlockTime.value },
//   );
// };

const aniContentValues = (elementsToAni: NodeListOf<HTMLElement>) => {
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
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.05 },
          "<=+0.1",
        );
      }
    }
  }
};

const tlNewBlockAniIn = gsap.timeline({
  onComplete: () => {
    // animateNewBlockInProgress();
  },
});

const animateNewBlockAdded = (
  target: Element | ComponentPublicInstance | null,
  blockTimestamp: string,
) => {
  if (!target) return;
  const el = target as Element;
  if (el.classList.contains("block-added")) return;

  tlNewBlockAniIn.fromTo(
    el,
    { height: 0 },
    { height: "236px", duration: 1.55 },
  );

  tlNewBlockAniIn.call(
    () => {
      const blockToAnimate = blocks.value.get(blockTimestamp);
      if (blockToAnimate) {
        blockToAnimate.blockAniIn = true;
      }
    },
    undefined,
    "",
  );

  const valuesElementsIndex0 = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value.ani-index-0",
  );
  aniContentValues(valuesElementsIndex0);

  const valuesElementsIndex1 = (el as Element).querySelectorAll<HTMLElement>(
    ".content-value.ani-index-1",
  );
  aniContentValues(valuesElementsIndex1);

  // animateNewBlockInProgress();

  tlNewBlockAniIn.play();
  el.classList.add("block-added");
};

const { data: initialBlocks } = await useFetch(
  "/api/playground/eth-blocks/latest",
);
initialBlocks.value?.forEach((raw: BlockExtended) => {
  const block = deserializeBlock(raw);
  blocks.value.set(block.timestamp.toString(), generateBlockData(block));
});

let eventSource: EventSource;

const addBlockListener = () => {
  eventSource = new EventSource("/api/playground/eth-blocks/watch");
  eventSource.onmessage = async ({ data }) => {
    const block = deserializeBlock(JSON.parse(data));
    if (blocks.value.has(block.timestamp.toString())) return;
    blocks.value.set(block.timestamp.toString(), generateBlockData(block));
    await nextTick();
    if (blocks.value.size > maxBlocks) {
      eventSource.close();
    }
  };
};

const imgHtmlEl = ref<HTMLImageElement | null>(null);

onUnmounted(() => eventSource?.close());

onMounted(async () => {
  addBlockListener();
  if (imgHtmlEl.value) {
    ethBlocksAnimation.init(imgHtmlEl.value);
  }
});

//https://www.shadertoy.com/view/wccSDf
// https://www.shadertoy.com/view/wccSDf
//     https://www.shadertoy.com/view/3cdXDX
//         https://www.shadertoy.com/view/tfyXRz
</script>
<style lang="scss" scoped>
.eth-base-text {
  font-size: 12px;
}

.eth-large-text {
  font-size: 50px;
  font-weight: 900;
}

.eth-blocks-page {
  position: relative;
  //padding-top: 25%;
  min-height: 100vh;
  color: white;
}

.eth-bg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .eth-bg-image-holder {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  .eth-bg-image {
    position: relative;
    width: 100%;
    opacity: 0;
  }
}

.eth-blocks {
  padding-top: 25%;
  //border: 1px solid red;
}

//.block-in-progress-wrapper {
//  max-width: 423px;
//  margin: 0px auto;
//  border: 1px solid white;
//  border-radius: 5px;
//}
//.block-in-progress-loader {
//  height: 6px;
//  width: 0;
//  background: white;
//  position: relative;
//  border-radius: 5px;
//}

.eth-block {
  overflow: hidden;
  height: 0;
  display: block;
  position: relative;
  width: 423px;
  margin: 20px auto;
  border: 1px solid white;
  border-radius: 25px;

  .content-wrapper {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    //justify-content: space-between;
    margin: 15px 0;
  }

  .content-row {
    padding: 15px 30px;
    justify-items: start;
    justify-content: space-between;
    display: flex;

    &.row-wrap {
      flex-wrap: wrap;
    }
  }

  .content-block {
    &.supply {
      width: 50%;

      &:last-child {
        margin-top: 20px;
      }

      svg {
        position: relative;
        top: 3px;
        margin-right: 8px;
      }
    }
  }

  .content-title {
    padding-right: 10px;
    //padding-bottom: 3px;
    &.gas {
      padding-bottom: 8px;
    }
  }

  .gas-block {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .gas-chart {
    padding-right: 15px;
  }

  .gas-stat-line {
    margin-bottom: 13px;
  }

  .content-value {
  }

  .content-char {
    opacity: 0;
  }

  .text-bold {
    font-weight: bold;
  }
}
</style>
