<template>
  <div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('home', false)"
      class="page-section"
      data-nav-id="home"
    >
      <SectionHero />
    </div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('about', false)"
      class="page-section"
      data-nav-id="about"
    >
      <SectionAbout />
    </div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('examples', false)"
      class="page-section"
      data-nav-id="examples"
    >
      <SectionExamples />
    </div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('playground', true)"
      class="page-section"
      data-nav-id="playground"
    >
      <SectionPlayground />
    </div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('roadmap', true)"
      class="page-section"
      data-nav-id="roadmap"
    >
      <SectionRoadmap />
    </div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('support', true)"
      class="page-section"
      data-nav-id="support"
    >
      <SectionSupport />
    </div>
    <div
      v-canvas3-scroll-action="setSectionActivationOptions('contact', true)"
      class="page-section"
      data-nav-id="contact"
    >
      <SectionContact />
    </div>
    <div>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionExamples from "~/pages/index/SectionExamples.vue";
import SectionHero from "~/pages/index/SectionHero.vue";
import SectionAbout from "~/pages/index/SectionAbout.vue";
import SectionRoadmap from "~/pages/index/SectionRoadmap.vue";
import SectionContact from "~/pages/index/SectionContact.vue";
import Footer from "~/components/common/Footer.vue";
import SectionPlayground from "~/pages/index/SectionPlayground.vue";
import SectionSupport from "~/pages/index/SectionSupport.vue";

const navigationStore = useNavigationStore();

const setSectionActivationOptions = (
  sectionId: string,
  sectionContrast: boolean,
) => {
  return {
    trackOnly: true,
    activateCallback: () => {
      navigationStore.setActiveNavItem(sectionId);
      navigationStore.setNavContrast(sectionContrast);
    },
    activeRangeOrigin: 0, // top
    bidirectionalActivation: true,
    activeRangeMargin: 100,
  };
};
</script>

<style lang="scss"></style>
