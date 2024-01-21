<script setup lang="ts">
import { onMounted } from "vue";

import { storage } from "@/constants";
import { useConstantStore, useUserStore } from "@/store";

const constantStore = useConstantStore();
const userStore = useUserStore();

onMounted(async () => {
  const promises = [constantStore.initFetch()];
  const isLoggedIn = localStorage.getItem(storage.IS_LOGGED_IN);

  if (isLoggedIn === "true") {
    promises.push(userStore.initFetch());
  }

  await Promise.allSettled(promises);
});
</script>

<template>
  <article>
    <div v-if="constantStore.isRootLoading" class="loader">
      <i class="pi pi-spin pi-spinner" style="font-size: 5rem"></i>
    </div>
    <slot v-else></slot>
  </article>
</template>

<style scoped lang="scss">
article {
  min-height: calc(100dvh - 70px - 32px);
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 70px;
  padding: 40px 20px 100px;
  display: flex;
  justify-content: center;

  .loader {
    height: 50vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
