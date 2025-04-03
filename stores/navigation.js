import { defineStore } from "pinia";

export const useNavigationStore = defineStore("navigationStore", {
  state: () => ({
    canvasInitiated: false,
    activeNavItem: "home",
    navVisible: true,
    navContrastSwitched: false,
    navigationItems: [
      { name: "Home", id: "home" },
      { name: "About", id: "about" },
      { name: "Examples", id: "examples" },
      { name: "Roadmap", id: "roadmap" },
      { name: "Contact", id: "contact" },
    ],
  }),
  actions: {
    setActiveNavItem(id) {
      this.activeNavItem = id;
    },
    setNavContrast(contrastSwitched) {
      this.navContrastSwitched = contrastSwitched;
    },
    setProjectRefs(refs) {
      this.projects.htmlRefs = refs;
    },
  },
});
