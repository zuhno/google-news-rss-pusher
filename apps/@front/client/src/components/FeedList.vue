<script setup lang="ts">
import { response } from "http-api-type";
import type { PropType } from "vue";
import FeedItemSkeleton from "./FeedItemSkeleton.vue";

const { feeds, loading } = defineProps({
  feeds: Object as PropType<response.GetFeedsResponse["list"]>,
  loading: Boolean,
});

function dateFormatting(date: string) {
  const _date = new Date(date);
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return formatter.format(_date);
}
</script>

<template>
  <ul>
    <template v-if="loading">
      <div v-for="k in 4" :key="k">
        <FeedItemSkeleton />
      </div>
    </template>
    <template v-else>
      <li v-for="feed in feeds" :key="feed.id">
        <div>
          <a :href="feed.count_link!" target="_blank" rel="noreferer">
            <template v-if="feed.thumbnail">
              <img :src="feed.thumbnail" alt="" onerror="this.src='/no-image.png'" />
            </template>
            <template v-else>
              <img src="/no-image.png" alt="" />
            </template>
          </a>
          <div>
            <a :href="feed.count_link!" target="_blank" rel="noreferer">
              <span>{{ feed.title }}</span>
              <i class="pi pi-external-link" style="font-size: 0.8rem"></i>
            </a>
            <div>
              <p>
                <span>🗞️ {{ feed.publisher }}</span>
                <span>👁️‍🗨️ {{ feed.view }}</span>
              </p>
              <span>{{ dateFormatting(feed.created_at) }}</span>
            </div>
          </div>
        </div>
      </li>
    </template>
  </ul>
</template>

<style scoped lang="scss">
ul {
  width: 100%;
  display: grid;
  gap: 35px;

  li {
    display: flex;
    flex-direction: column;

    &:not(:last-of-type) {
      &::after {
        content: "";
        width: 100%;
        height: 1px;
        background-color: rgb(225, 225, 225);
        margin-top: 30px;
      }
    }

    & > div {
      display: flex;
      gap: 20px;

      img {
        width: 180px;
        aspect-ratio: 1 / 0.7;
        object-fit: contain;
        transition: opacity 0.2s;

        @media (hover: hover) {
          &:hover {
            opacity: 0.6;
          }
        }
      }

      & > div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 5px 0;

        a {
          width: fit-content;
          display: flex;
          gap: 10px;
          transition: 0.2s;
          font-weight: 700;

          @media (hover: hover) {
            &:hover {
              color: gray;
            }
          }
        }

        div {
          display: flex;
          flex-direction: column;
          gap: 10px;

          span {
            font-size: 14px;
          }

          p {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }
  }
}
</style>
