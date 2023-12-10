<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { response } from "http-api-type";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import FeedList from "@/components/FeedList.vue";

interface Data {
  feedsByCategory: Record<number, response.GetFeedsResponse["list"]>;
  linkMap: Record<number, string>;
}

const localState = ref<Data>({
  feedsByCategory: {},
  linkMap: { 1: "/real-estate", 2: "blockchain" },
});
const constantStore = useConstantStore();

onMounted(async () => {
  for (const category of constantStore.categories) {
    const { data } = await apis.get.getFeeds({ params: { categoryId: category.id, limit: 4 } });
    localState.value.feedsByCategory = {
      ...localState.value.feedsByCategory,
      [category.id]: data.list,
    };
  }
});
</script>

<template>
  <section>
    <template v-for="category in constantStore.categories" :key="category.id">
      <div>
        <p>
          <span>{{ category.title }}</span>
          <router-link :to="localState.linkMap[category.id]"><button>...more</button></router-link>
        </p>
        <FeedList :feeds="localState.feedsByCategory[category.id]" />
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
section {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
