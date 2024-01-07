<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";
import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
} from "vue3-google-signin";
import { useUserStore } from "@/store";

import apis from "@/apis";
import { useConstantStore } from "@/store";

const controller = new AbortController();

const { mutateAsync } = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string }>) =>
    apis.post.postGoogleAccess({ ...config, signal: controller.signal }),
});

const userStore = useUserStore(); 

const handleOnSuccess = async (response: ImplicitFlowSuccessResponse) => {
  if (typeof response.code !== "string" || !response.code) return;

  try {
    const { data } = await mutateAsync({ data: { code: response.code } });
    userStore.setInfo(data);
  
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
  redirect_uri: constantStore.googleClientInfo?.redirectUri,
});
</script>

<template>
  <template v-if="!userStore.info">
    <button :disabled="!isReady" @click="() => login()">Login with Google</button>
  </template>
  <template v-else>
    <div class="profile">
      <img :src="userStore.info.avatarUrl" alt="" />
      <span>{{ userStore.info.nickName }}</span>
    </div>
  </template>
</template>

<style scoped lang="scss">
button {
  outline: none;
  border: none;
}

.profile {
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
    border-radius: 10rem;
    margin-right: 10px;
  }
}
</style>
