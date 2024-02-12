<script setup lang="ts">
import { useRouter } from "vue-router";

import { useConstantStore } from "@/store";
import { feedRoute } from "@/constants";
import GoogleLoginButton from "../GoogleLoginButton.vue";
import LogoutButton from "../LogoutButton.vue";

const router = useRouter();
const constantStore = useConstantStore();

const isActive = (path: string) => {
  return path === router.currentRoute.value.path ? "active" : null;
};
</script>

<template>
  <header>
    <div>
      <div class="logo">
        <router-link to="/"> Google News </router-link>
      </div>
      <nav>
        <template v-for="link in Object.values(feedRoute.linkMap)" :key="link.path">
          <router-link :class="isActive(link.path)" :to="link.path">{{ link.label }}</router-link>
        </template>
      </nav>
    </div>
    <template v-if="!constantStore.isRootLoading">
      <div>
        <LogoutButton />

        <GoogleLoginButton />
      </div>
    </template>
  </header>
</template>

<style scoped lang="scss">
header {
  position: fixed;
  top: 0;
  z-index: 10;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
  box-sizing: border-box;
  background-color: white;

  & > div {
    display: flex;
    align-items: center;

    .logo {
      margin-right: 50px;

      a {
        font-size: 20px;
        font-weight: 900;
      }
    }

    nav {
      display: inherit;
      gap: 20px;

      a {
        padding: 10px 20px;
        border-radius: 5px;
        transition: all 0.2s;

        &.active {
          background-color: black;
          color: white;
        }

        &:hover {
          &:not(.active) {
            background-color: whitesmoke;
          }
        }
      }
    }
  }
}
</style>
