import axios, { type AxiosRequestConfig } from "axios";

import { response } from "http-api-type";

interface AxiosRequestConfigWithParam<P, D = any> extends AxiosRequestConfig<D> {
  params: P;
}

const instance = axios.create({ baseURL: import.meta.env.VITE_SERVER_DOMAIN, timeout: 10000 });

export default {
  get: {
    getFeeds: (
      config?: AxiosRequestConfigWithParam<
        {
          lastKey?: number | null;
          limit?: number;
          categoryId: number;
        },
        { code: string }
      >
    ) => instance.get<response.GetFeedsResponse>("/feeds", config),
    getConstants: (config?: AxiosRequestConfig) =>
      instance.get<response.GetConstantsResponse>("/constants", config),
  },
  post: {
    postSlackAccess: (config: AxiosRequestConfig<{ code: string }>) =>
      instance.post<response.PostOAuth2SlackAccessResponse>("/oauth2/slack", config.data, config),
  },
};
