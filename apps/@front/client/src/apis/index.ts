import axios, { type AxiosRequestConfig } from "axios";

import { response } from "http-api-type";

const instance = axios.create({ baseURL: import.meta.env.VITE_SERVER_DOMAIN, timeout: 10000 });

export default {
  feed: {
    get: {
      realEstates: (config?: AxiosRequestConfig) =>
        instance.get<response.RealEstateResponse>("/feed/real-estate", config),
      blockchains: (config?: AxiosRequestConfig) =>
        instance.get<response.BlockchainResponse>("/feed/blockchain", config),
    },
  },
};
