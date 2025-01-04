<script setup lang="ts">
import { response } from "http-api-type";
import type { PropType } from "vue";
import FeedItemSkeleton from "./FeedItemSkeleton.vue";
import noImg from "@/assets/img/no-image.png";
import ListItemAds from "./ads/ListItemAds.vue";

type HTMLImageElementEvent = {
  target: HTMLImageElement;
} & Event;

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

function setDefaultImage(event: Event) {
  const { target } = event as HTMLImageElementEvent;
  target.src = noImg;
}
</script>

<template>
  <ul>
    <template v-if="loading">
      <li v-for="k in 4" :key="k">
        <FeedItemSkeleton />
      </li>
    </template>
    <template v-else>
      <!-- coupang ads -->
      <li>
        <ListItemAds />
      </li>

      <!-- feed list -->
      <li v-for="feed in feeds" :key="feed.id">
        <a :href="feed.count_link!" target="_blank" rel="noreferrer nofollow">
          <div>
            <p>
              <span>{{ feed.title }}</span>
              <i class="pi pi-external-link" style="font-size: 0.8rem"></i>
            </p>
            <div>
              <p>
                <span>🗞️ {{ feed.publisher }}</span>
                <span>👁️‍🗨️ {{ feed.view }}</span>
              </p>
              <span>{{ dateFormatting(feed.created_at) }}</span>
            </div>
          </div>
        </a>
      </li>
    </template>
  </ul>
</template>

<style scoped lang="scss">
@import "@/assets/scss/variables";
@import "@/assets/scss/mixins";

ul {
  width: 100%;
  display: grid;
  gap: 30px;

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

    & > a {
      padding: 15px;
      border-radius: 8px;
      transition: background-color 0.2s;

      @include mediaHover {
        background-color: whitesmoke;
      }

      & > div {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 5px 0;

        & > p {
          width: fit-content;
          display: flex;
          gap: 10px;
          font-weight: 700;

          & > span {
            font-size: 1rem;
          }
        }

        & > div {
          display: flex;
          flex-direction: column;
          gap: 10px;

          @include mqMax($breakpoint-mobile) {
            gap: 4px;
            margin-top: 10px;
          }

          span {
            font-size: 0.8rem;
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
