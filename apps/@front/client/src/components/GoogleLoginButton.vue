<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";
import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
} from "vue3-google-signin";

import apis from "@/apis";
import { useConstantStore } from "@/store";

const controller = new AbortController();

const { mutateAsync } = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string }>) =>
    apis.post.postGoogleAccess({ ...config, signal: controller.signal }),
});

const handleOnSuccess = async (response: ImplicitFlowSuccessResponse) => {
  if (typeof response.code !== "string" || !response.code) return;

  try {
    const { data } = await mutateAsync({ data: { code: response.code } });

    console.log("data: ", data);
  } catch (err) {
    console.error("err : ", err);
  }
};

const handleOnError = (errorResponse: ImplicitFlowErrorResponse) => {
  console.log("Error: ", errorResponse);
};

const constantStore = useConstantStore();

const { isReady, login } = useCodeClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
  redirect_uri: constantStore.googleClientInfo.redirectUri,
});
</script>

<template>
  <button :disabled="!isReady" @click="() => login()">Login with Google</button>
</template>

<style scoped lang="scss">
button {
  outline: none;
  border: none;
}
</style>
