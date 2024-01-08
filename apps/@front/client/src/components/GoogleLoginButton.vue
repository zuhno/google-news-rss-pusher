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
import { onMounted } from "vue";

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
    userStore.setInfo(data);
    localStorage.setItem("gnrp_access_token", data.accessToken);
    localStorage.setItem("isLoggedIn", "true");
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

onMounted(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn) {
    // TODO: fetch userInfo
  }
});
</script>

<template>
  <template v-if="!userStore.info">
    <button :disabled="!isReady" @click="() => login()">Login with Google</button>
  </template>
  <template v-else>
    <div class="profile">
      <img :src="userStore.info.avatarUrl!" alt="" />
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
