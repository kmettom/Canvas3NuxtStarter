import { defineStore } from "pinia";

export const useDisplayStore = defineStore("displayStore", {
  state: (): {
    isMobile: boolean | null;
    isTablet: boolean | null;
    mobileBreakPoint: number;
    tabletBreakPoint: number;
    prefersReducedMotion: boolean;
  } => ({
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
        "(prefers-reduced-motion: reduce)",
      ).matches;
    },
    resizeListener() {
      window.addEventListener("resize", () => {
        this.setScreenSize();
        // Canvas3.resizeOnChange();
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
