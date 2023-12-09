import type { AxiosRequestConfigWithParam } from "@/types";
import axios, { type AxiosRequestConfig } from "axios";

import { response } from "http-api-type";

const instance = axios.create({ baseURL: import.meta.env.VITE_SERVER_DOMAIN, timeout: 10000 });

export default {
  get: {
    getFeeds: (
      config?: AxiosRequestConfigWithParam<{
        lastKey?: number | null;
        limit?: number;
        categoryId: number;
      }>
    ) => instance.get<response.FeedsResponse>("/feeds", config),
    getConstants: (config?: AxiosRequestConfig) =>
      instance.get<response.ConstantResponse>("/constants", config),
  },
};
