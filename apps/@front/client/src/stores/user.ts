import { defineStore } from "pinia";

import apis from "@/apis";

export const useUserStore = defineStore("user", () => {
  const initFetch = async () => {
    try {
      await Promise.all([apis.get.getVerify()]);
    } catch (error) {
      console.error("initFetch#user Error : ", error);
    }
  };

  return { initFetch };
});
