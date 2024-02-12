<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";
import { useCookies } from "@vueuse/integrations/useCookies";

import apis from "@/apis";
import { cookie } from "@/constants";

const controller = new AbortController();

const userLogoutMutate = useMutation({
  mutationFn: async (config?: AxiosRequestConfig) =>
    apis.post.postUserLogout({ ...config, signal: controller.signal }),
});

const cookies = useCookies([cookie.LOGGED_IN_USER]);

const onLogout = async () => {
  try {
    await userLogoutMutate.mutateAsync({});
  } catch (error) {
    console.log("logout error : ", error);
  }
};

onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <template v-if="!!cookies.get(cookie.LOGGED_IN_USER)">
    <button @click="onLogout">logout</button>
  </template>
</template>

<style scoped lang="scss">
button {
  border: none;
  outline: none;
  cursor: pointer;
}

button {
  margin-right: 20px;
}
</style>
