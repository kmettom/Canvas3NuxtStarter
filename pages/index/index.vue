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
    <!--    <div-->
    <!--      v-canvas3-scroll-action="setSectionActivationOptions('support', true)"-->
    <!--      class="page-section"-->
    <!--      data-nav-id="support"-->
    <!--    >-->
    <!--      <SectionSupport />-->
    <!--    </div>-->
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
import SectionExamples from "~/components/home/SectionExamples.vue";
import SectionHero from "~/components/home/SectionHero.vue";
import SectionAbout from "~/components/home/SectionAbout.vue";
import SectionContact from "~/components/home/SectionContact.vue";
import Footer from "~/components/common/Footer.vue";
import SectionPlayground from "~/components/home/SectionPlayground.vue";
// import SectionSupport from "~/components/home/SectionSupport.vue";

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
