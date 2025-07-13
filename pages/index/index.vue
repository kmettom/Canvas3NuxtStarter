<template>
  <div>
    <div
      v-onScrollActivate="setSectionActivationOptions('home', false)"
      class="page-section"
      data-nav-id="home"
    >
      <SectionHero :section-activate="pageActive" />
    </div>
    <div
      v-onScrollActivate="setSectionActivationOptions('about', false)"
      class="page-section"
      data-nav-id="about"
    >
      <SectionAbout />
    </div>
    <!--    <div-->
    <!--      v-onScrollActivate="setSectionActivationOptions('services', true)"-->
    <!--      v-set-data-attrs="{ cursorcolor: 'dark' }"-->
    <!--      class="page-section"-->
    <!--      data-nav-id="services"-->
    <!--    >-->
    <!--      <SectionServices />-->
    <!--    </div>-->
    <div
      v-onScrollActivate="setSectionActivationOptions('examples', false)"
      class="page-section"
      data-nav-id="examples"
    >
      <SectionExamples />
    </div>
    <div
      v-onScrollActivate="setSectionActivationOptions('roadmap', true)"
      class="page-section"
      data-nav-id="roadmap"
    >
      <SectionRoadmap />
    </div>
    <div
      v-onScrollActivate="setSectionActivationOptions('contact', true)"
      v-set-data-attrs="{ cursorcolor: 'dark' }"
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

<script setup>
import SectionExamples from "~/pages/index/SectionExamples.vue";
import SectionHero from "~/pages/index/SectionHero.vue";
import SectionAbout from "~/pages/index/SectionAbout.vue";
import SectionRoadmap from "~/pages/index/SectionRoadmap.vue";
import SectionContact from "~/pages/index/SectionContact.vue";
import Footer from "~/components/common/Footer.vue";

useSeoMeta({
  title: "NUXTTHREEJSSTARTERPACK",
  ogTitle: "NUXTTHREEJSSTARTERPACK",
  description: "NUXTTHREEJSSTARTERPACK",
  ogDescription: "NUXTTHREEJSSTARTERPACK",
});

const navigationStore = useNavigationStore();

// const props = defineProps({
//   pageActive: Boolean,
// });

const setSectionActivationOptions = (sectionId, sectionContrast) => {
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
