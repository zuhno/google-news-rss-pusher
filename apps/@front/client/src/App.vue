<script lang="ts">
import { RouterView } from "vue-router";
import RootLayout from "@/components/layout/RootLayout.vue";
import HeaderSection from "@/components/layout/HeaderSection.vue";
import FooterSection from "@/components/layout/FooterSection.vue";

export default {
  components: {
    RouterView,
    HeaderSection,
    FooterSection,
    RootLayout,
  },
};
</script>

<template>
  <main>
    <HeaderSection />
    <RootLayout>
      <RouterView />
    </RootLayout>
    <FooterSection />
  </main>
</template>
