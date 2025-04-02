import { defineStore } from 'pinia';

export const useDisplayStore = defineStore('displayStore', {
  state: () => ({
    isMobile: null,
    isTablet: null,
    mobileBreakPoint: 768,
    tabletBreakPoint: 1050,
    prefersReducedMotion: false,
  }),
  actions: {
    init() {
      this.setScreenSize();
      this.resizeListener();
      this.prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
    },
    resizeListener() {
      window.addEventListener('resize', () => {
        this.setScreenSize();
      });
    },
    setScreenSize() {
      if (
        (window.innerWidth < this.mobileBreakPoint &&
          this.isMobile === false) ||
        (window.innerWidth >= this.mobileBreakPoint && this.isMobile === true)
      ) {
        window.location.reload();
      }
      this.isMobile = window.innerWidth < this.mobileBreakPoint;
      this.isTablet = window.innerWidth < this.tabletBreakPoint;
    },
  },
});
