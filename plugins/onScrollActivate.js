import { Canvas3 } from "~/utils/canvas3.js";
import { defineNuxtPlugin } from "#app";
// import { useCanvas3Store } from "~/stores/canvas3";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("onScrollActivate", {
    mounted(el, binding) {
      // const Canvas3 = useCanvas3Store();

      el.dataset.scrollActivateId = crypto.randomUUID();

      if (binding.value?.scrollSpeedSetTo?.value) {
        el.dataset.scrollSpeed = binding.value?.scrollSpeedSetTo?.value;
      }

      const navigationStore = useNavigationStore();

      if (navigationStore.canvasInitiated) {
        Canvas3.addOnScrollActivateElement({
          elNode: el,
          options: binding.value,
          arg: binding.arg,
        });
      } else {
        const unsubscribe = navigationStore.$subscribe((mutation, state) => {
          if (state.canvasInitiated) {
            Canvas3.addOnScrollActivateElement({
              elNode: el,
              options: binding.value,
              arg: binding.arg,
            });
            unsubscribe(); // Stop listening after completion
          }
        });
      }
    },
    updated(el, binding) {
      // const Canvas3 = useCanvas3Store();

      Canvas3.updateOnScrollActiveElement({
        elNode: el,
        options: binding.value,
        arg: binding.arg,
      });
    },
    unmounted(el) {
      // const Canvas3 = useCanvas3Store();
      Canvas3.removeScrollActiveElement(el);
    },
  });
});

// const onScrollActivateOptions = {
//   activeRange: Number,
//   activateOnce: Boolean, // default false
//   activateCallback: () => {},
//   trackOnly: Boolean,
//   bidirectionalActivation: Boolean (default: false),
//   activeRangeOrigin: Number (0-1, 0 from top of screen, 1 bottom of the screen)
//   activeRangeMargin: Number
//   fixToParentId: String (id of parent element),
//   onScrollCallback: (item, speed) => {},
//   scrollSpeedSetTo: {value: Number, duration: Number}
// }
