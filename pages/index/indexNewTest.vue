<template>
  <div>
    <Canvas3Image
      :image-settings="{
        srcLink: 'images/01.JPG',
        alt: 'background wave on beach',
      }"
    />
  </div>
</template>

<script setup>
useSeoMeta({
  title: "NUXTTHREEJSSTARTERPACK",
  ogTitle: "NUXTTHREEJSSTARTERPACK",
  description: "NUXTTHREEJSSTARTERPACK",
  ogDescription: "NUXTTHREEJSSTARTERPACK",
});

// const navigationStore = useNavigationStore();

// const setSectionActivationOptions = (sectionId, sectionContrast) => {
//   return {
//     trackOnly: true,
//     activateCallback: () => {
//       navigationStore.setActiveNavItem(sectionId);
//       navigationStore.setNavContrast(sectionContrast);
//     },
//     activeRangeOrigin: 0, // top
//     bidirectionalActivation: true,
//     activeRangeMargin: 100,
//   };
// };
</script>

<style lang="scss"></style>
