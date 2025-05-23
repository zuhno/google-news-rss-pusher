<script setup lang="ts">
import { onUnmounted, reactive, watch } from "vue";
import { response } from "http-api-type";
import { useQuery } from "@tanstack/vue-query";

import apis from "@/apis";
import { useConstantStore } from "@/stores";
import { storage } from "@/constants";
import SlackBtn from "@/components/SlackBtn.vue";
import FeedList from "@/components/FeedList.vue";
import { useRoute } from "vue-router";

interface Data {
  querylastKey: string | null;
  feeds: response.GetFeedsResponse["list"];
  hasNext: boolean;
  appByCategoryId: response.GetConstantsResponse["apps"][number];
  title?: string;
  categoryId: number;
}

const controller = new AbortController();

const route = useRoute();

const localState = reactive<Data>({
  querylastKey: null,
  feeds: [],
  hasNext: false,
  appByCategoryId: [],
  title: "",
  categoryId: Number(route.query.keyword),
});
const constantStore = useConstantStore();

const { isFetching, data, isLoading, refetch } = useQuery({
  queryKey: ["getFeeds", localState.categoryId, localState.querylastKey],
  queryFn: () =>
    apis.get.getFeeds({
      signal: controller.signal,
      params: {
        lastKey: localState.querylastKey,
        limit: 10,
        categoryId: localState.categoryId,
      },
    }),
});

watch(
  () => route.query.keyword,
  (categoryId) => {
    localState.hasNext = false;
    localState.querylastKey = null;
    localState.feeds = [];
    localState.appByCategoryId = [];
    localState.title = "";
    localState.categoryId = Number(categoryId);
    sessionStorage.setItem(storage.CATEGORY, String(categoryId));
    refetch();
  },
  { immediate: true }
);

watch(
  () => ({ feeds: data.value, constant: constantStore }),
  ({ feeds, constant }) => {
    if (feeds) {
      localState.hasNext = feeds.data.hasNext;
      localState.querylastKey = feeds.data.lastKey || null;
      localState.feeds = [...localState.feeds, ...(feeds.data.list || [])];
    }
    if (constant.apps) {
      localState.appByCategoryId = constant.apps?.[localState.categoryId] || [];
      localState.title = constant.categories?.find(
        (category) => category.id === localState.categoryId
      )?.title;
    }
  }
);

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

    <h1>{{ localState.title }}</h1>

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
@use "@/assets/scss/variables";
@use "@/assets/scss/mixins";

section {
  max-width: 700px;
  width: 100%;

  .messenger-btn-wrapper {
    position: fixed;
    bottom: 50px;
    right: 100px;
    display: grid;
    gap: 10px;

    @include mixins.mqMax(variables.$breakpoint-mobile) {
      bottom: 50px;
      right: 30px;
    }
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 40px;
    text-transform: uppercase;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 70px;

    button {
      width: fit-content;
      font-size: 0.9rem;
      border: none;
      outline: none;
      width: 100px;
      height: 40px;
      border-radius: 5px;
      background-color: whitesmoke;
      color: black;
      cursor: pointer;
    }
  }
}
</style>
