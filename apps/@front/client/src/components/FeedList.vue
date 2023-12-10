<script setup lang="ts">
import { response } from "http-api-type";
import type { PropType } from "vue";

const { feeds } = defineProps({ feeds: Object as PropType<response.GetFeedsResponse["list"]> });

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
    <li v-for="feed in feeds" :key="feed.id">
      <a :href="feed.link!" target="_blank" rel="noreferer">
        <span>{{ feed.title }}</span>
        <i class="pi pi-external-link" style="font-size: 0.8rem"></i>
      </a>
      <div>
        <span>📰 {{ feed.publisher }}</span>
        <span>{{ dateFormatting(feed.created_at) }}</span>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
ul {
  width: 100%;
  margin: 20px 0;
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
      }
    }

    a {
      width: fit-content;
      display: flex;
      gap: 10px;
      transition: 0.2s;
      font-weight: 700;
      margin-bottom: 10px;

      @media (hover: hover) {
        &:hover {
          color: gray;
        }
      }
    }

    div {
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;

      span {
        font-size: 14px;
      }
    }
  }
}
</style>
