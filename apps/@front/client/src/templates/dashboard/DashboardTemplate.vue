<script setup lang="ts">
import { onUnmounted } from "vue";
import { useQuery } from "@tanstack/vue-query";

import apis from "@/apis";
import { useConstantStore } from "@/stores";
import FeedList from "@/components/FeedList.vue";

const controller = new AbortController();

const constantStore = useConstantStore();

const { isLoading, data } = useQuery({
  queryKey: ["getFeedsLimitedAll"],
  queryFn: () => apis.get.getFeedsLimitedAll({ signal: controller.signal, params: { limit: 4 } }),
  refetchOnMount: false,
});

onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <section>
    <template v-for="category in constantStore.categories" :key="category.id">
      <div v-if="category.id">
        <p>
          <span>{{ category.title }}</span>
          <router-link :to="'/feed?keyword=' + category.id">
            <button>...more</button>
          </router-link>
        </p>
        <FeedList :feeds="data?.data[category.id]" :loading="isLoading" />
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables";
@use "@/assets/scss/mixins";

section {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 50px;
  justify-items: center;

  @include mixins.mqMax(variables.$breakpoint-mobile) {
    grid-template-columns: repeat(1, 1fr);
  }

  div {
    max-width: 500px;
    width: 100%;

    &:not(:last-of-type) {
      margin-bottom: 50px;
    }

    p {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 30px;

      span {
        font-size: 1.5rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      button {
        outline: none;
        border: none;
        background-color: transparent;
        font-weight: 500;
        transition: all 0.2s;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        background-color: whitesmoke;
        color: black;

        &:hover {
          background-color: black;
          color: white;
        }
      }
    }
  }
}
</style>
