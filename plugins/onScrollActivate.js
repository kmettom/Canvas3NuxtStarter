import { Canvas } from '~/utils/canvas.js';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('onScrollActivate', {
    mounted(el, binding) {
      el.dataset.scrollActivateId = crypto.randomUUID();

      if (binding.value?.scrollSpeedSetTo?.value) {
        el.dataset.scrollSpeed = binding.value?.scrollSpeedSetTo?.value;
      }

      const navigationStore = useNavigationStore();

      if (navigationStore.canvasInitiated) {
        Canvas.addOnScrollActivateElement({
          elNode: el,
          options: binding.value,
          arg: binding.arg,
        });
      } else {
        const unsubscribe = navigationStore.$subscribe((mutation, state) => {
          if (state.canvasInitiated) {
            Canvas.addOnScrollActivateElement({
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
      Canvas.updateOnScrollActiveElement({
        elNode: el,
        options: binding.value,
        arg: binding.arg,
      });
    },
    unmounted(el) {
      Canvas.removeScrollActiveElement(el);
    },
  });
});

// const onScrollActivateOptions = {
//   activeRange: Number,
//   activateOnce: Boolean, // default false
//   activateCallback: String,
//   trackOnly: Boolean,
//   bidirectionalActivation: Boolean (default: false),
//   activeRangeOrigin: Number (0-1, 0 from top of screen, 1 bottom of the screen)
//   activeRangeMargin: Number
//   fixToParentId: String,
//   onScrollCallback: (item, speed) => {},
//   scrollSpeed: {value: Number},
//  scrollSpeedSetTo: {value: Number, duration: Number}

// }
