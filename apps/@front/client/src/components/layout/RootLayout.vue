<script lang="ts">
import { mapActions, mapState } from "pinia";
import { useConstantStore } from "@/store";

export default {
  computed: {
    ...mapState(useConstantStore, ["isRootLoading"]),
  },
  async mounted() {
    this.initFetch();
  },
  methods: {
    ...mapActions(useConstantStore, ["initFetch"]),
  },
};
</script>

<template>
  <article>
    <div v-if="isRootLoading" class="loader">
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
