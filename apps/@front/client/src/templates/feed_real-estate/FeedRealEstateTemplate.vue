<script setup lang="ts">
import { onMounted, ref } from "vue";
import { response } from "http-api-type";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import SlackBtn from "@/components/SlackBtn.vue";
import FeedList from "@/components/FeedList.vue";

interface Data {
  clientId: string;
  querylastKey: number | null;
  feeds: response.GetFeedsResponse["list"];
  hasNext: boolean;
  isLoading: boolean;
  categoryId: number | null;
  appByCategoryId: response.GetConstantsResponse["apps"][number];
}

const localState = ref<Data>({
  clientId: import.meta.env.VITE_SLACK_CLIENT_ID,
  querylastKey: null,
  feeds: [],
  hasNext: false,
  isLoading: false,
  categoryId: null,
  appByCategoryId: [],
});
const constantStore = useConstantStore();

async function fetchList() {
  localState.value.isLoading = true;

  try {
    const { data } = await apis.get.getFeeds({
      params: {
        lastKey: localState.value.querylastKey,
        limit: 10,
        categoryId: localState.value.categoryId!,
      },
    });
    localState.value.hasNext = data.hasNext;
    if (data.lastKey) localState.value.querylastKey = data.lastKey;
    if (data.list.length > 0) localState.value.feeds = [...localState.value.feeds, ...data.list];
  } catch (error) {
    console.error(error);
  } finally {
    localState.value.isLoading = false;
  }
}

onMounted(async () => {
  localState.value.categoryId = constantStore.categories.find(
    (category) => category.title === "부동산"
  )!.id;
  localState.value.appByCategoryId = constantStore.apps[localState.value.categoryId] || [];

  await fetchList();
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

      <button v-if="localState.hasNext" @click="fetchList()">
        <div v-if="localState.isLoading">
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
