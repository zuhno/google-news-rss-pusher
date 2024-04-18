<script setup lang="ts">
import { RouterView } from "vue-router";
import RootLayout from "@/components/layout/RootLayout.vue";
import HeaderSection from "@/components/layout/HeaderSection.vue";
import FooterSection from "@/components/layout/FooterSection.vue";
console.log("deploy by github actions - test", import.meta.env.VITE_SERVER_DOMAIN);
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
