import type { AxiosRequestConfig } from "axios";

export interface AxiosRequestConfigWithParam<T> extends AxiosRequestConfig {
  params: T;
}
