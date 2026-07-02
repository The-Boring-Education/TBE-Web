import { getAccessToken } from "@tbe/auth";
import axios from "axios";

import {
  getBaseUrlForPlatformEnv,
  getStoredPlatformEnv,
} from "@/hooks/useEnvironment";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const env = getStoredPlatformEnv();
    config.baseURL = getBaseUrlForPlatformEnv(env);
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const onLoginPage = window.location.pathname.startsWith("/login");
      const onCallback = window.location.pathname.startsWith("/auth/callback");
      if (!onLoginPage && !onCallback) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
