import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";

import { toast } from "@/components/ui/sonner";
import api from "@/lib/axios";
import { logApiError, logApiSuccess } from "@/lib/logInterceptor";

type AnyAxiosConfig = {
  method?: string;
  url?: string;
  baseURL?: string;
};

function buildPath(url?: string): string {
  if (!url) return "";
  try {
    // If full URL, parse; else just return path
    if (url.startsWith("http")) {
      const u = new URL(url);
      return u.pathname + (u.search || "");
    }
    return url;
  } catch {
    return url;
  }
}

function onResponseSuccess(response: AxiosResponse) {
  const cfg = response.config as AnyAxiosConfig;
  const method = (cfg.method || "GET").toUpperCase();
  const path = buildPath(cfg.url);
  const status = response.status;

  // Show success toast for all requests
  toast.success(`${method} ${path} → ${status}`);

  // Log API success response
  logApiSuccess(method, path, status, response.data);

  return response;
}

function onResponseError(error: AxiosError) {
  const cfg = (error.config || {}) as AnyAxiosConfig;
  const method = (cfg.method || "GET").toUpperCase();
  const path = buildPath(cfg.url);
  const status = (error.response && error.response.status) || "Error";
  const serverMessage =
    (error.response?.data as any)?.message ||
    (error.response?.data as any)?.detail ||
    error.message;

  toast.error(`${method} ${path} → ${status}`, {
    description: serverMessage,
  });

  // Log API error response
  logApiError(method, path, status, serverMessage, error.response?.data);

  return Promise.reject(error);
}

// Attach to default axios (covers Agents and any direct axios usage)
axios.interceptors.response.use(onResponseSuccess, onResponseError);

// Attach to platform axios instance
api.interceptors.response.use(onResponseSuccess, onResponseError);
