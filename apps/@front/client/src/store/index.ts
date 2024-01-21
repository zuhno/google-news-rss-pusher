import apis from "@/apis";
import { defineStore } from "pinia";
import { response } from "http-api-type";
import { ref } from "vue";
import { storage } from "@/constants";

interface ConstantState {
  categories: response.GetConstantsResponse["categories"];
  apps: response.GetConstantsResponse["apps"];
  isRootLoading: boolean;
  googleClientInfo: response.GetOAuth2GoogleClientInfoResponse;
}

interface UserState extends response.PostOAuth2GoogleAccessResponse {}

export const useConstantStore = defineStore("constant", () => {
  const categories = ref<ConstantState["categories"]>([]);
  const apps = ref<ConstantState["apps"] | null>(null);
  const googleClientInfo = ref<ConstantState["googleClientInfo"] | null>(null);
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
      console.error("initFetch#constant Error : ", error);
    } finally {
      isRootLoading.value = false;
    }
  };

  return { categories, apps, isRootLoading, googleClientInfo, initFetch };
});

export const useUserStore = defineStore("user", () => {
  const user = ref<UserState | null>(null);

  const setUser = (userInfo: response.PostOAuth2GoogleAccessResponse) => {
    user.value = userInfo;
  };

  const resetUser = () => {
    user.value = null;
    localStorage.removeItem(storage.IS_LOGGED_IN);
  };

  const initFetch = async () => {
    try {
      const { data } = await apis.get.getUser();
      user.value = data;
    } catch (error) {
      localStorage.removeItem(storage.IS_LOGGED_IN);
      console.error("initFetch#user Error : ", error);
    }
  };

  return { user, setUser, resetUser, initFetch };
});
