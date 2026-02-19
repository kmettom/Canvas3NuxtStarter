import { defineNuxtPlugin } from "#app";
import { Canvas3 } from "#canvas3-nuxt/utils/canvas3/canvas3";
import { setOutPromise } from "~/composables/useOutPromise";
import {pageTransition} from "~/utils/animations/pageTransition";

export default defineNuxtPlugin((nuxtApp) => {

  nuxtApp.hook("page:start", () => {
    const p = (async () => {

      Canvas3.setMeshPositionsUpdate(true);
      await pageTransition.start();
      Canvas3.scrollToTop(0);
    })();
    setOutPromise(p);
  });
  nuxtApp.hook("page:finish", async () => {
    // await waitForPageTransitionDone();

    await pageTransition.end();
    Canvas3.setMeshPositionsUpdate(false);
    // navigationStore.setPageTransitionOverlayOutProgress(false);
  });

  // nuxtApp.hook("page:error", () => {
  //   // navigationStore.setPageTransitionInProgress(false);
  //   // pageTransition.end();
  //   Canvas3.setMeshPositionsUpdate(false);
  // });
});
