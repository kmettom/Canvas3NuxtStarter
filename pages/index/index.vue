<template>
  <div>
    <div
      v-onScrollActivate="setSectionActivationOptions('home', false)"
      class="page-section"
      data-nav-id="home"
    >
      <SectionHero :section-activate="props.pageActive" />
    </div>
    <div
      v-onScrollActivate="setSectionActivationOptions('about', false)"
      class="page-section"
      data-nav-id="about"
    >
      <SectionAbout />
    </div>
    <div
      v-onScrollActivate="setSectionActivationOptions('services', true)"
      v-set-data-attrs="{ cursorcolor: 'dark' }"
      class="page-section"
      data-nav-id="services"
    >
      <SectionServices />
    </div>
    <div
      v-onScrollActivate="setSectionActivationOptions('work', false)"
      class="page-section"
      data-nav-id="work"
    >
      <SectionProjects />
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
import SectionProjects from '~/pages/index/projects/SectionProjects.vue';
import SectionServices from '~/pages/index/services/SectionServices.vue';
import SectionHero from '~/pages/index/SectionHero.vue';
import SectionAbout from '~/pages/index/SectionAbout.vue';
import SectionContact from '~/pages/index/SectionContact.vue';
import Footer from '~/components/common/Footer.vue';

useSeoMeta({
  title: 'Tomas Kmet - Web developer',
  ogTitle: 'Tomas Kmet - Web developer',
  description: 'web3 | creative | web apps | websites | e-commerce',
  ogDescription: 'web3 | creative | web apps | websites | e-commerce',
});

const navigationStore = useNavigationStore();

const props = defineProps({
  pageActive: Boolean,
});

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
