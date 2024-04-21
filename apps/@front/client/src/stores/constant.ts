import { defineStore } from "pinia";
import { response } from "http-api-type";
import { ref } from "vue";

import apis from "@/apis";

interface StoreState {
  categories: response.GetConstantsResponse["categories"];
  apps: response.GetConstantsResponse["apps"];
  isRootLoading: boolean;
  googleClientInfo: response.GetOAuth2GoogleClientInfoResponse;
}

export const useConstantStore = defineStore("constant", () => {
  const categories = ref<StoreState["categories"]>([]);
  const apps = ref<StoreState["apps"] | null>(null);
  const googleClientInfo = ref<StoreState["googleClientInfo"] | null>(null);
  const isRootLoading = ref<StoreState["isRootLoading"]>(true);

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
      console.error("initFetch#constant Error : ", error);
    } finally {
      isRootLoading.value = false;
    }
  };

  return { categories, apps, isRootLoading, googleClientInfo, initFetch };
});
