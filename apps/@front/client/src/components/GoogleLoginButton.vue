<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";
import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
} from "vue3-google-signin";

import apis from "@/apis";
import { useConstantStore, useUserStore } from "@/store";
import { storage } from "@/constants";

const controller = new AbortController();

const googleAccessMutate = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string }>) =>
    apis.post.postGoogleAccess({ ...config, signal: controller.signal }),
});
// const userInfoMutate = useMutation({mutationFn: async()=> apis.get.getUserInfo()});

const userStore = useUserStore();
const constantStore = useConstantStore();

const handleOnSuccess = async (response: ImplicitFlowSuccessResponse) => {
  if (typeof response.code !== "string" || !response.code) return;

  try {
    const { data } = await googleAccessMutate.mutateAsync({ data: { code: response.code } });
    userStore.setUser(data);
    localStorage.setItem(storage.IS_LOGGED_IN, "true");
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
  redirect_uri: constantStore.googleClientInfo?.redirectUri,
});

onUnmounted(() => {
  controller.abort();
});
</script>

<template>
  <template v-if="!userStore.user">
    <button :disabled="!isReady" @click="login">Login with Google</button>
  </template>
  <template v-else>
    <div>
      <div class="profile">
        <img :src="userStore.user.avatarUrl!" alt="" />
        <span>{{ userStore.user.nickName }}</span>
      </div>
    </div>
  </template>
</template>

<style scoped lang="scss">
button {
  outline: none;
  border: none;
  cursor: pointer;
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
