<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";

import apis from "@/apis";
import { useUserStore } from "@/store";

const controller = new AbortController();

const userStore = useUserStore();

const userLogoutMutate = useMutation({
  mutationFn: async (config?: AxiosRequestConfig) =>
    apis.post.postUserLogout({ ...config, signal: controller.signal }),
});

const onLogout = async () => {
  try {
    const { data } = await userLogoutMutate.mutateAsync({});
    if (data.count > 0) userStore.resetUser();
  } catch (error) {
    console.log("logout error : ", error);
  }
};

onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <template v-if="!!userStore.user">
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
