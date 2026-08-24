import type { AxiosRequestConfig, AxiosResponse } from "axios";

import { getStoredAgentsEnv } from "@/hooks/useEnvironment";
import api from "@/lib/axios";

/**
 * Client for the Agents service that routes every request through the platform
 * API's authenticated proxy (`/agents-proxy/*`, gated by admin JWT) instead of
 * hitting the Agents service directly from the browser.
 *
 * The selected Agents environment (local | dev | prod) is forwarded via the
 * `x-agents-env` header so the runtime environment switcher keeps working; the
 * proxy maps it to a server-side allowlist of Agents base URLs.
 */

const PROXY_PREFIX = "/agents-proxy";

const withAgentsEnv = (config?: AxiosRequestConfig): AxiosRequestConfig => ({
  ...config,
  headers: {
    ...config?.headers,
    "x-agents-env": getStoredAgentsEnv(),
  },
});

/** Join the proxy prefix with an Agents path like `/quiz/sessions`. */
const toProxyUrl = (agentsPath: string): string => {
  const normalized = agentsPath.startsWith("/") ? agentsPath : `/${agentsPath}`;
  return `${PROXY_PREFIX}${normalized}`;
};

export const agentsClient = {
  get: <T = unknown>(
    agentsPath: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    api.get<T>(toProxyUrl(agentsPath), withAgentsEnv(config)),

  post: <T = unknown>(
    agentsPath: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    api.post<T>(toProxyUrl(agentsPath), data, withAgentsEnv(config)),

  put: <T = unknown>(
    agentsPath: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    api.put<T>(toProxyUrl(agentsPath), data, withAgentsEnv(config)),

  delete: <T = unknown>(
    agentsPath: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    api.delete<T>(toProxyUrl(agentsPath), withAgentsEnv(config)),
};
