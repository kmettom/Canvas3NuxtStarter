import { defineStore } from "pinia";

export const useNavigationStore = defineStore("navigationStore", {
  state: () => ({
    canvasInitiated: false,
    activeNavItem: "home",
    navVisible: true,
    navContrastSwitched: false,
    pageTransitionInProgress: false,
    navigationItems: [
      { name: "Home", id: "home" },
      { name: "About", id: "about" },
      { name: "Examples", id: "examples" },
      { name: "Playground", id: "playground" },
      { name: "Roadmap", id: "roadmap" },
      { name: "Contact", id: "contact" },
    ],
  }),
  actions: {
    setActiveNavItem(id: string) {
      this.activeNavItem = id;
    },
    setNavContrast(contrastSwitched: boolean) {
      this.navContrastSwitched = contrastSwitched;
    },
    setPageTransitionInProgress(status: boolean) {
      this.pageTransitionInProgress = status;
    },
  },
});
