import apis from "@/apis";
import { defineStore } from "pinia";
import type { response } from "http-api-type";
import { ref } from "vue";

interface State {
  categories: response.GetConstantsResponse["categories"];
  apps: response.GetConstantsResponse["apps"];
  isRootLoading: boolean;
  googleClientInfo: response.GetOAuth2GoogleClientInfoResponse;
}

export const useConstantStore = defineStore("constant", () => {
  const categories = ref<State["categories"]>([]);
  const apps = ref<State["apps"]>({});
  const googleClientInfo = ref<State["googleClientInfo"]>({ clientId: "", redirectUri: "" });
  const isRootLoading = ref<State["isRootLoading"]>(true);

  const initFetch = async () => {
    try {
      const [_constants, _googleClientInfo] = await Promise.all([
        apis.get.getConstants(),
        apis.get.getGoogleClientInfo(),
      ]);

      categories.value = _constants.data.categories;
      apps.value = _constants.data.apps;
      googleClientInfo.value = _googleClientInfo.data;
    } catch (error) {
      console.error("initFetch Error : ", error);
    } finally {
      isRootLoading.value = false;
    }
  };

  return { categories, apps, isRootLoading, googleClientInfo, initFetch };
});
