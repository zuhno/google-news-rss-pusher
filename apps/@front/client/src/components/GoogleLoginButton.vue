<script setup lang="ts">
import { onUnmounted } from "vue";
import { useMutation } from "@tanstack/vue-query";
import type { AxiosRequestConfig } from "axios";
import {
  useCodeClient,
  type ImplicitFlowSuccessResponse,
  type ImplicitFlowErrorResponse,
} from "vue3-google-signin";
import { useCookies } from "@vueuse/integrations/useCookies";

import apis from "@/apis";
import { useConstantStore } from "@/store";
import { cookie } from "@/constants";

const controller = new AbortController();

const googleAccessMutate = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string }>) =>
    apis.post.postGoogleAccess({ ...config, signal: controller.signal }),
});

const cookies = useCookies([cookie.LOGGED_IN_USER]);
const constantStore = useConstantStore();

const handleOnSuccess = async (response: ImplicitFlowSuccessResponse) => {
  if (typeof response.code !== "string" || !response.code) return;

  try {
    await googleAccessMutate.mutateAsync({ data: { code: response.code } });
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
  <template v-if="!!cookies.get(cookie.LOGGED_IN_USER)">
    <div>
      <div class="profile">
        <img :src="cookies.get(cookie.LOGGED_IN_USER).avatarUrl" alt="" />
        <span>{{ cookies.get(cookie.LOGGED_IN_USER).nickName }}</span>
      </div>
    </div>
  </template>
  <template v-else>
    <button :disabled="!isReady" @click="login">Login with Google</button>
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
