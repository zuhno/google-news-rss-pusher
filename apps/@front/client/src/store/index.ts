import apis from "@/apis";
import { defineStore } from "pinia";
import type { response } from "http-api-type";
import { ref } from "vue";

interface State {
  categories: response.GetConstantsResponse["categories"];
  apps: response.GetConstantsResponse["apps"];
  isRootLoading: boolean;
}

export const useConstantStore = defineStore("constant", () => {
  const categories = ref<State["categories"]>([]);
  const apps = ref<State["apps"]>({});
  const isRootLoading = ref<State["isRootLoading"]>(true);

  const initFetch = async () => {
    try {
      const { data } = await apis.get.getConstants();
      categories.value = data.categories;
      apps.value = data.apps;
    } catch (error) {
      console.error("initFetch Error : ", error);
    } finally {
      isRootLoading.value = false;
    }
  };

  return { categories, apps, isRootLoading, initFetch };
});
