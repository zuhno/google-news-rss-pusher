<script setup lang="ts">
import { useRouter } from "vue-router";
import { reactive } from "vue";

import { useConstantStore } from "@/stores";
import { feedRoute } from "@/constants";
import GoogleLoginButton from "../GoogleLoginButton.vue";

const router = useRouter();
const constantStore = useConstantStore();

const localState = reactive({
  drawer: false,
});

const isActive = (path: string) => {
  return path === router.currentRoute.value.path ? "active" : null;
};
</script>

<template>
  <v-layout>
    <header>
      <div class="hamburger" @click.stop="localState.drawer = !localState.drawer">
        <pre></pre>
      </div>
      <div>
        <div class="logo">
          <router-link to="/">G.N.R.P</router-link>
        </div>
        <nav>
          <li>
            <span>Keywords</span>
            <v-menu activator="parent">
              <v-list>
                <v-list-item
                  v-for="link in Object.values(feedRoute.linkMap)"
                  :key="link.path"
                  :ripple="false"
                >
                  <router-link :class="isActive(link.path)" :to="link.path">
                    <v-list-item-title>
                      {{ link.label }}
                    </v-list-item-title>
                  </router-link>
                </v-list-item>
              </v-list>
            </v-menu>
          </li>
        </nav>
      </div>
      <div>
        <template v-if="!constantStore.isRootLoading">
          <GoogleLoginButton />
        </template>
      </div>
    </header>

    <v-navigation-drawer v-model="localState.drawer" temporary>
      <li>
        <p>Keywords</p>
        <v-menu activator="parent">
          <v-list class="drawer-list">
            <v-list-item
              v-for="link in Object.values(feedRoute.linkMap)"
              :key="link.path"
              :ripple="false"
            >
              <router-link :class="isActive(link.path)" :to="link.path">
                <v-list-item-title>
                  {{ link.label }}
                </v-list-item-title>
              </router-link>
            </v-list-item>
          </v-list>
        </v-menu>
      </li>
    </v-navigation-drawer>
  </v-layout>
</template>

<style scoped lang="scss">
@import "@/assets/scss/variables";
@import "@/assets/scss/mixins";

header {
  position: fixed;
  top: 0;
  z-index: 1005;
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
  box-sizing: border-box;
  background-color: white;
  box-shadow: 0 4px 15px rgba(225, 225, 225, 0.4);

  .hamburger {
    display: none;
    padding: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    @include mediaHover {
      background-color: whitesmoke;
    }

    pre {
      width: 15px;
      height: 1.5px;
      background-color: #000000;
    }
    &::before,
    &::after {
      content: "";
      display: block;
      width: 15px;
      height: 1.5px;
      background-color: #000000;
    }
    &::before {
      margin-bottom: 3px;
    }
    &::after {
      margin-top: 3px;
    }
  }

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
      display: flex;
      align-items: center;
      gap: 20px;

      li {
        cursor: pointer;
        padding: 10px 20px;
        border-radius: 5px;
        transition: all 0.2s;
        font-weight: 500;
        &:hover {
          background-color: whitesmoke;
        }
      }
    }
  }

  @include mqMax($breakpoint-mobile) {
    padding: 0 20px;
    .hamburger {
      display: block;
    }
    & > div {
      .logo {
        margin-right: 0;
      }
      nav {
        display: none;
      }
    }
  }
}

:deep(.v-list) {
  top: 5px;
  left: 0;
  box-shadow: 0 2px 5px #00000017 !important;
  width: 100% !important;

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
}

:deep(.v-navigation-drawer) {
  padding-top: 70px;
  li {
    width: 100%;
    padding: 10px;
    cursor: pointer;
    box-sizing: border-box;

    & > p {
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      border-radius: 5px;
      border: 1px solid rgb(235, 235, 235);

      @include mediaHover {
        background-color: whitesmoke;
      }
    }
  }
}

:deep(.drawer-list) {
  top: -10px !important;
  left: -2px !important;
  width: calc(100% - 20px) !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
  border: 1px solid rgb(235, 235, 235) !important;
}
</style>
