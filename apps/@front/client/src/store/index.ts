import apis from "@/apis";
import { defineStore } from "pinia";
import type { response } from "http-api-type";

interface State {
  categories: response.ConstantResponse["categories"];
  apps: response.ConstantResponse["apps"];
  isRootLoading: boolean;
}

export const useConstantStore = defineStore("constant", {
  state: (): State => ({
    categories: [],
    apps: {},
    isRootLoading: true,
  }),
  actions: {
    async initFetch() {
      try {
        const { data } = await apis.get.getConstants();
        this.categories = data.categories;
        this.apps = data.apps;
      } catch (error) {
        console.error(error);
      } finally {
        this.isRootLoading = false;
      }
    },
  },
});
