import { defineNuxtPlugin } from "#app";
import { Canvas3 } from "#canvas3-nuxt/utils/canvas3/canvas3";
// import { useNavigationStore } from "~/stores/navigation";
// import {
//   pageTransition,
//   transitionVideoPlayerAni,
//   waitForPageTransitionDone,
// } from "~/utils/animations/pageTransition";
// import { directorsOverlayHideOnPageChange } from "~/utils/animations/navigation";
// import { setOutPromise } from "~/composables/useCurtainSync";

export default defineNuxtPlugin((nuxtApp) => {
  // const navigationStore = useNavigationStore();
  // const { $navigationAniToFinal } = nuxtApp;

  nuxtApp.hook("page:start", () => {
    // const p = (async () => {
    console.log("start transition");
    // navigationStore.setPageTransitionInProgress(true);

    Canvas3.setMeshPositionsUpdate(true);

    // if (!navigationStore.navigationFinalLayout) {
    //   navigationStore.toggleShowDirectors(false);
    //   if (
    //     $navigationAniToFinal &&
    //     typeof $navigationAniToFinal.transformToFinal === "function"
    //   ) {
    //     await $navigationAniToFinal.transformToFinal(0.65);
    //   }
    // }

    // navigationStore.setNavTheme("greyDark", true);

    // if (navigationStore.showDirectors) {
    //   await directorsOverlayHideOnPageChange();
    // }

    // if (navigationStore.filmPlayerVimeoId) {
    //   await transitionVideoPlayerAni(false);
    // }

    // await pageTransition.start();

    Canvas3.scrollToTop(0);

    // navigationStore.setFilmPlayerId("");
    // navigationStore.setPageTransitionInProgress(false);
    // })();
    // setOutPromise(p);
  });
  nuxtApp.hook("page:finish", async () => {
    // navigationStore.setPageTransitionOverlayOutProgress(true);
    // await waitForPageTransitionDone();

    // navigationStore.toggleShowDirectors(false);

    // if (
    //   navigationStore.navigationFinalLayout &&
    //   $navigationAniToFinal &&
    //   $navigationAniToFinal.tl &&
    //   typeof $navigationAniToFinal.tl.progress === "function"
    // ) {
    //   $navigationAniToFinal.tl.progress(1);
    // }

    // await pageTransition.end();
    Canvas3.setMeshPositionsUpdate(false);
    // navigationStore.setPageTransitionOverlayOutProgress(false);
  });

  // nuxtApp.hook("page:error", () => {
  //   // navigationStore.setPageTransitionInProgress(false);
  //   // pageTransition.end();
  //   Canvas3.setMeshPositionsUpdate(false);
  // });
});
