<script setup lang="ts">
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { response } from "http-api-type";
import { useQuery } from "@tanstack/vue-query";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import SlackBtn from "@/components/SlackBtn.vue";
import FeedList from "@/components/FeedList.vue";
import { storage } from "@/constants";

interface Data {
  querylastKey: number | null;
  feeds: response.GetFeedsResponse["list"];
  hasNext: boolean;
  categoryId: number | null;
  appByCategoryId: response.GetConstantsResponse["apps"][number];
}

const controller = new AbortController();

const localState = reactive<Data>({
  querylastKey: null,
  feeds: [],
  hasNext: false,
  categoryId: null,
  appByCategoryId: [],
});
const constantStore = useConstantStore();

localState.categoryId = constantStore.categories.find(
  (category) => category.title === "부동산"
)!.id;
localState.appByCategoryId = constantStore.apps?.[localState.categoryId] || [];

const { isFetching, data, refetch } = useQuery({
  queryKey: ["getFeeds", localState.categoryId, localState.querylastKey],
  queryFn: async () => {
    return apis.get.getFeeds({
      signal: controller.signal,
      params: {
        lastKey: localState.querylastKey,
        limit: 10,
        categoryId: localState.categoryId!,
      },
    });
  },
});

watch(
  () => data.value,
  (newValue) => {
    if (!newValue) return;
    localState.hasNext = newValue.data.hasNext;
    localState.querylastKey = newValue.data.lastKey || null;
    localState.feeds = [...localState.feeds, ...(newValue.data.list || [])];
  }
);

onMounted(() => {
  sessionStorage.setItem(storage.CATEGORY, String(localState.categoryId));
});

onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <section>
    <div class="messenger-btn-wrapper">
      <template v-for="app in localState.appByCategoryId" :key="app.authorizeLink">
        <template v-if="app.from === 'SLACK'">
          <SlackBtn :authorize-link="app.authorizeLink" />
        </template>
      </template>
    </div>

    <div class="content">
      <FeedList :feeds="localState.feeds" />

      <button v-if="localState.hasNext" @click="refetch()">
        <div v-if="isFetching">
          <i class="pi pi-spin pi-spinner" style="font-size: 1rem"></i>
        </div>
        <div v-else>More</div>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
section {
  max-width: 700px;
  width: 100%;

  .messenger-btn-wrapper {
    position: fixed;
    bottom: 50px;
    right: 100px;
    display: grid;
    gap: 10px;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 70px;

    button {
      width: fit-content;
      font-size: 15px;
      border: none;
      outline: none;
      width: 100px;
      height: 40px;
      border-radius: 5px;
      background-color: #f5f5f5;
      cursor: pointer;
    }
  }
}
</style>
