import axios, { type AxiosRequestConfig } from "axios";

import { response } from "http-api-type";

export interface AxiosRequestConfigWithParam<P, D = any> extends AxiosRequestConfig<D> {
  params: P;
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_DOMAIN,
  timeout: 30000,
  withCredentials: true,
});

export default {
  get: {
    getFeeds: (
      config?: AxiosRequestConfigWithParam<{
        lastKey?: number | null;
        limit?: number;
        categoryId: number;
      }>
    ) => instance.get<response.GetFeedsResponse>("/feeds", config),
    getFeedsLimitedAll: (
      config?: AxiosRequestConfigWithParam<{
        limit?: number;
      }>
    ) => instance.get<response.GetFeedsLimitedAllResponse>("/feeds/all", config),
    getConstants: (config?: AxiosRequestConfig) =>
      instance.get<response.GetConstantsResponse>("/constants", config),
    getGoogleClientInfo: (config?: AxiosRequestConfig) =>
      instance.get<response.GetOAuth2GoogleClientInfoResponse>("/oauth2/google", config),
    getUser: (config?: AxiosRequestConfig) =>
      instance.get<response.GetUserResponse>("/users", config),
  },
  post: {
    postSlackAccess: (config: AxiosRequestConfig<{ code: string; category: string }>) =>
      instance.post<response.PostOAuth2SlackAccessResponse>("/oauth2/slack", config.data, config),
    postGoogleAccess: (config: AxiosRequestConfig<{ code: string }>) =>
      instance.post<response.PostOAuth2GoogleAccessResponse>("/oauth2/google", config.data, config),
    postUserLogout: (config?: AxiosRequestConfig) =>
      instance.post<response.PostUserLogoutResponse>("/users/logout", config?.data, config),
  },
};
