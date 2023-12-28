<script setup lang="ts">
import apis from "@/apis";
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";
import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
} from "vue3-google-signin";

const controller = new AbortController();

const { mutateAsync } = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string }>) =>
    apis.post.postGoogleAccess({ ...config, signal: controller.signal }),
});

const handleOnSuccess = async (response: ImplicitFlowSuccessResponse) => {
  if (typeof response.code !== "string" || !response.code) return;

  try {
    const { data } = await mutateAsync({ data: { code: response.code } });
  } catch (err) {
    console.error("err : ", err);
  }
};

const handleOnError = (errorResponse: ImplicitFlowErrorResponse) => {
  console.log("Error: ", errorResponse);
};

const { isReady, login } = useCodeClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
  // other options
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
