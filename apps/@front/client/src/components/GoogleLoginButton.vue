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
import { useConstantStore } from "@/stores";
import { cookie } from "@/constants";

const controller = new AbortController();

const googleAccessMutate = useMutation({
  mutationFn: async (config: AxiosRequestConfig<{ code: string }>) =>
    apis.post.postGoogleAccess({ ...config, signal: controller.signal }),
});
const userLogoutMutate = useMutation({
  mutationFn: async (config?: AxiosRequestConfig) =>
    apis.post.postUserLogout({ ...config, signal: controller.signal }),
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

const onLogout = async () => {
  try {
    await userLogoutMutate.mutateAsync({});
  } catch (error) {
    console.log("logout error : ", error);
  }
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
        <v-menu activator="parent">
          <v-list>
            <v-list-item
              v-for="(item, index) in ['Logout']"
              :key="index"
              :value="index"
              :ripple="false"
            >
              <v-list-item-title @click="onLogout">{{ item }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </template>
  <template v-else>
    <button class="login-button--google" :disabled="!isReady" @click="login">
      {{ `Google\nLogin` }}
    </button>
  </template>
</template>

<style scoped lang="scss">
@import "@/assets/scss/mixins";
@import "@/assets/scss/variables";

.login-button--google {
  outline: none;
  border: none;
  cursor: pointer;
  border-radius: 5rem;
  background-color: transparent;
  padding: 8px 12px;
  transition: all 0.2s linear;
  white-space: nowrap;

  &:hover {
    background-color: #000000;
    color: #ffffff;
  }

  @include mqMax($breakpoint-mobile) {
    white-space: pre-line;
  }
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 36px;
  padding: 0 8px;
  border-radius: 5px;
  user-select: none;
  transition: all 0.2s;

  @include mediaHover {
    background-color: whitesmoke;
  }

  img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 10px;
  }

  @include mqMax($breakpoint-mobile) {
    img {
      margin-right: 0;
      width: 30px;
      height: 30px;
    }
    span {
      display: none;
    }
  }
}

:deep(.v-list) {
  top: 5px;
  left: 25px;
  box-shadow: 0 2px 5px #00000017 !important;
  width: fit-content !important;

  .v-list-item {
    min-height: 0 !important;
    padding: 0;
    .v-list-item__overlay {
      background-color: transparent !important;
    }
    .v-list-item-title {
      padding: 5px 15px;
      color: #000000 !important;
      text-align: center;
      transition: all 0.2s linear;
      &:hover {
        background-color: #e8e8e8;
      }
    }
  }

  @include mqMax($breakpoint-mobile) {
    left: 0;
    right: 20px;
  }
}
</style>
