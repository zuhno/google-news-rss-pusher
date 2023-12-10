<script setup lang="ts">
import { useConstantStore } from "@/store";
import { onMounted } from "vue";

const constantStore = useConstantStore();

onMounted(async () => {
  await constantStore.initFetch();
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
