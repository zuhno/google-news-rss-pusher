<script setup lang="ts">
import apis from "@/apis";
import { isAxiosError } from "axios";
import type { response } from "http-api-type";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

interface InstalledData extends response.PostOAuth2SlackAccessResponse {}
interface ErrorData {
  message: string;
}

const route = useRoute();
const router = useRouter();

const installedData = ref<InstalledData | null>(null);
const errorData = ref<ErrorData | null>(null);

onMounted(async () => {
  const code = route.query.code;
  if (typeof code !== "string" || !code) return;

  try {
    const { data } = await apis.post.postSlackAccess({ data: { code } });

    if (!data || !data.channelId) return;

    installedData.value = { ...data };
  } catch (error) {
    let message = "";

    if (isAxiosError(error)) {
      if (error.response?.data.statusCode === 400) message = "이미 등록된 채널입니다.";
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
</script>

<template>
  <div>
    <div v-if="installedData">{{ installedData?.channelName }} 채널에 설치가 완료되었습니다.</div>
    <div v-else>{{ errorData?.message }}</div>

    <div v-if="installedData || errorData">4초 뒤에 대시보드 페이지로 이동됩니다.</div>
  </div>
</template>
