<script setup lang="ts">
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { response } from "http-api-type";
import { useQuery } from "@tanstack/vue-query";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import { storage } from "@/constants";
import SlackBtn from "./SlackBtn.vue";
import FeedList from "./FeedList.vue";

interface Data {
  querylastKey: number | null;
  feeds: response.GetFeedsResponse["list"];
  hasNext: boolean;
  appByCategoryId: response.GetConstantsResponse["apps"][number];
}

const controller = new AbortController();

const { id } = defineProps({ id: Number });

const localState = reactive<Data>({
  querylastKey: null,
  feeds: [],
  hasNext: false,
  appByCategoryId: [],
});
const constantStore = useConstantStore();

const { isFetching, data, isLoading, refetch } = useQuery({
  queryKey: ["getFeeds", id, localState.querylastKey],
  queryFn: () =>
    apis.get.getFeeds({
      signal: controller.signal,
      params: {
        lastKey: localState.querylastKey,
        limit: 10,
        categoryId: id!,
      },
    }),
});

watch(
  () => ({ feeds: data.value, constant: constantStore }),
  ({ feeds, constant }) => {
    if (feeds) {
      localState.hasNext = feeds.data.hasNext;
      localState.querylastKey = feeds.data.lastKey || null;
      localState.feeds = [...localState.feeds, ...(feeds.data.list || [])];
    }
    if (constant.apps) {
      localState.appByCategoryId = constant.apps?.[id!] || [];
    }
  }
);

onMounted(() => {
  sessionStorage.setItem(storage.CATEGORY, String(id));
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
      <FeedList :feeds="localState.feeds" :loading="isLoading" />

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
