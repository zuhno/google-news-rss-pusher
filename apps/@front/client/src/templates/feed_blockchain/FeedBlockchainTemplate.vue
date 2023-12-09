<script lang="ts">
import { response } from "http-api-type";
import { mapState } from "pinia";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import SlackBtn from "@/components/SlackBtn.vue";
import FeedList from "@/components/FeedList.vue";

interface Data {
  clientId: string;
  querylastKey: number | null;
  feeds: response.FeedsResponse["list"];
  hasNext: boolean;
  isLoading: boolean;
  categoryId: number | null;
  appByCategoryId: response.ConstantResponse["apps"][number];
}

export default {
  data(): Data {
    return {
      clientId: import.meta.env.VITE_SLACK_CLIENT_ID,
      querylastKey: null,
      feeds: [],
      hasNext: false,
      isLoading: false,
      categoryId: null,
      appByCategoryId: [],
    };
  },
  computed: {
    ...mapState(useConstantStore, ["categories", "apps"]),
  },
  async mounted() {
    this.categoryId = this.categories.find((category) => category.title === "블록체인")!.id;
    this.appByCategoryId = this.apps[this.categoryId] || [];

    await this.fetchList();
  },
  methods: {
    async fetchList() {
      this.isLoading = true;

      try {
        const { data } = await apis.get.getFeeds({
          params: {
            lastKey: this.querylastKey,
            limit: 10,
            categoryId: this.categoryId!,
          },
        });
        this.hasNext = data.hasNext;
        if (data.lastKey) this.querylastKey = data.lastKey;
        if (data.list.length > 0) this.feeds = [...this.feeds, ...data.list];
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  components: { SlackBtn, FeedList },
};
</script>

<template>
  <section>
    <div class="messenger-btn-wrapper">
      <template v-for="app in appByCategoryId" :key="app.authorizeLink">
        <template v-if="app.from === 'SLACK'">
          <SlackBtn :authorize-link="app.authorizeLink" />
        </template>
      </template>
    </div>

    <div class="content">
      <FeedList :feeds="feeds" />

      <button v-if="hasNext" @click="fetchList()">
        <div v-if="isLoading">
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
