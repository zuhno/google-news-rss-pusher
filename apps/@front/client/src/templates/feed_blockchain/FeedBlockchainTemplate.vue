<script lang="ts">
import SlackBtn from "@/components/SlackBtn.vue";
import FeedList from "@/components/FeedList.vue";
import apis from "@/apis";
import { response } from "http-api-type";

interface Data {
  clientId: string;
  querylastKey?: number | null;
  feeds: response.BlockchainResponse["list"];
  hasNext: boolean;
  isPending: boolean;
}

export default {
  data(): Data {
    return {
      clientId: import.meta.env.VITE_SLACK_CLIENT_ID,
      querylastKey: null,
      feeds: [],
      hasNext: false,
      isPending: false,
    };
  },
  async mounted() {
    await this.fetchList();
  },
  methods: {
    async fetchList() {
      this.isPending = true;
      try {
        const { data } = await apis.feed.get.blockchains({
          params: { lastKey: this.querylastKey, limit: 10 },
        });
        this.hasNext = data.hasNext;
        if (data.lastKey) this.querylastKey = data.lastKey;
        if (data.list.length > 0) this.feeds = [...this.feeds, ...data.list];
      } catch (error) {
        console.error(error);
      } finally {
        this.isPending = false;
      }
    },
  },
  components: { SlackBtn, FeedList },
};
</script>

<template>
  <div class="slack-wrapper">
    <SlackBtn :client-id="clientId" />
  </div>

  <div class="content">
    <FeedList :feeds="feeds" />

    <button v-if="hasNext" @click="fetchList()">
      <div v-if="isPending">
        <i class="pi pi-spin pi-spinner" style="font-size: 1rem"></i>
      </div>
      <div v-else>More</div>
    </button>
  </div>
</template>

<style scoped lang="scss">
.slack-wrapper {
  position: fixed;
  bottom: 50px;
  right: 100px;
  align-self: flex-start;
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
</style>
