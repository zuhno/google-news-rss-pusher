<script setup lang="ts">
import { onUnmounted } from "vue";
import { useQuery } from "@tanstack/vue-query";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import FeedList from "@/components/FeedList.vue";

const controller = new AbortController();

const linkMap: { [categoryId: number]: string } = { 1: "/real-estate", 2: "blockchain" };

const constantStore = useConstantStore();

const { isLoading, data, error } = useQuery({
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
      <div>
        <p>
          <span>{{ category.title }}</span>
          <router-link :to="linkMap[category.id]"><button>...more</button></router-link>
        </p>
        <FeedList :feeds="data?.data[category.id]" />
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
section {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  justify-content: space-around;

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
      margin-bottom: 40px;

      span {
        font-size: 2rem;
        font-weight: 700;
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

        &:hover {
          background-color: black;
          color: white;
        }
      }
    }
  }
}
</style>
