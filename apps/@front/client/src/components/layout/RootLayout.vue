<script setup lang="ts">
import { onMounted } from "vue";

import { useConstantStore, useUserStore } from "@/stores";
import { useCookies } from "@vueuse/integrations/useCookies";
import { cookie } from "@/constants";

const cookies = useCookies([cookie.LOGGED_IN_USER]);
const constantStore = useConstantStore();
const userStore = useUserStore();

onMounted(async () => {
  const promises = [constantStore.initFetch()];

  if (!!cookies.get(cookie.LOGGED_IN_USER)) {
    promises.push(userStore.initFetch());
  }

  await Promise.allSettled(promises);
});
</script>

<template>
  <article>
    <slot></slot>
  </article>
</template>

<style scoped lang="scss">
article {
  min-height: calc(100dvh - 70px - 32px);
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 70px;
  padding: 60px 20px 100px;
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
