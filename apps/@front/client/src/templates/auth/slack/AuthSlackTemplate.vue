<script setup lang="ts">
import { isAxiosError, type AxiosRequestConfig } from "axios";
import type { response } from "http-api-type";
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMutation } from "@tanstack/vue-query";

import apis from "@/apis";
import { storage } from "@/constants";

interface InstalledData extends response.PostOAuth2SlackAccessResponse {}
interface ErrorData {
  message: string;
}

const controller = new AbortController();

const route = useRoute();
const router = useRouter();

const installedData = ref<InstalledData | null>(null);
const errorData = ref<ErrorData | null>(null);

const { mutateAsync } = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string; category: string }>) =>
    apis.post.postSlackAccess({ ...config, signal: controller.signal }),
});

onMounted(async () => {
  const { code } = route.query;
  const category = sessionStorage.getItem(storage.CATEGORY);
  if (typeof code !== "string" || typeof category !== "string" || !code || !category) return;

  try {
    const { data } = await mutateAsync({ data: { code, category } });

    if (!data || !data.channelId) return;

    installedData.value = { ...data };
  } catch (error) {
    let message = "";

    if (isAxiosError(error)) {
      if (error.response?.data.statusCode === 409)
        message = "선택한 뉴스 피드가 이미 추가되었습니다.";
      else message = error.response?.data.message;

      errorData.value = { message };
    } else if (error instanceof Error) {
      errorData.value = { message: error.message };
    }
  } finally {
    setTimeout(() => {
      router.replace("/");
    }, 4000);
  }
});

onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <div>
    <div v-if="installedData">{{ installedData?.channelName }} 채널에 설치가 완료되었습니다.</div>
    <div v-else>{{ errorData?.message }}</div>

    <div v-if="installedData || errorData">4초 뒤에 대시보드 페이지로 이동됩니다.</div>
  </div>
</template>
