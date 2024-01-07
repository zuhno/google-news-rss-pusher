import apis from "@/apis";
import { defineStore } from "pinia";
import { response } from "http-api-type";
import { ref } from "vue";

interface ConstantState {
  categories: response.GetConstantsResponse["categories"];
  apps: response.GetConstantsResponse["apps"];
  isRootLoading: boolean;
  googleClientInfo: response.GetOAuth2GoogleClientInfoResponse;
};

interface UserState extends response.PostOAuth2GoogleAccessResponse {};

export const useConstantStore = defineStore("constant", () => {
  const categories = ref<ConstantState["categories"]>([]);
  const apps = ref<ConstantState["apps"]|null>(null);
  const googleClientInfo = ref<ConstantState["googleClientInfo"]|null>(null);
  const isRootLoading = ref<ConstantState["isRootLoading"]>(true);

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

export const useUserStore = defineStore("user", () => {
  const info = ref<UserState | null>(null);

  const setInfo = (userInfo: response.PostOAuth2GoogleAccessResponse) => {
    info.value = userInfo;
  };

  return { info, setInfo };
})
