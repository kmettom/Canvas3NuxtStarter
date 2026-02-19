import { defineNuxtPlugin } from "#app";
import { Canvas3 } from "#canvas3-nuxt/utils/canvas3/canvas3";
import { setOutPromise } from "~/composables/useOutPromise";
import {
  pageTransition,
  waitForPageTransitionDone,
} from "~/utils/animations/pageTransition";

export default defineNuxtPlugin((nuxtApp) => {
  const navigationStore = useNavigationStore();

  nuxtApp.hook("page:start", () => {
    const p = (async () => {
      navigationStore.setPageTransitionInProgress(true);

      Canvas3.setMeshPositionsUpdate(true);
      await pageTransition.start();
      Canvas3.scrollToTop(0);
    })();
    setOutPromise(p);
  });
  nuxtApp.hook("page:finish", async () => {
    await waitForPageTransitionDone();
    await pageTransition.end();
    Canvas3.setMeshPositionsUpdate(false);
  });
});
