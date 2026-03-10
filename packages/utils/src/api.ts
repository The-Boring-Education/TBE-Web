import { envConfig } from "@tbe/constants";
import axios, { type AxiosRequestConfig } from "axios";
export interface APIMakeRequestProps {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: any;
  baseURL?: string;
  data?: any;
}

export interface APIResponseType {
  success?: boolean;
  status?: number | boolean;
  error?: any;
  message?: string;
  data?: any;
}

// Create axios instance with default configuration to handle CORS
const apiInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Important for CORS - don't send cookies cross-origin
  timeout: 30000, // 30 second timeout
});

// Add response interceptor to handle errors
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a network error (often CORS)
    if (!error.response) {
      console.error("Network Error (possibly CORS):", {
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });

      // Provide more helpful error message
      error.message =
        "Network error: Unable to reach the API. This may be a CORS issue if calling from browser.";
    }
    return Promise.reject(error);
  },
);

/**
 * Universal API request utility for TBE apps
 * Supports different base URLs for different services
 */
export const sendRequest = async ({
  method = "GET",
  url,
  headers,
  body,
  baseURL,
}: APIMakeRequestProps): Promise<APIResponseType> => {
  // Check if we're in the browser
  const isBrowser = typeof window !== "undefined";

  // If we're in the browser and no custom baseURL is provided, use the proxy
  const shouldUseProxy = isBrowser && !baseURL;

  let finalUrl: string;

  if (shouldUseProxy) {
    // Use the proxy route - keep absolute URLs untouched
    if (/^https?:\/\//i.test(url)) {
      finalUrl = url;
    } else {
      // remove leading slashes
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
      finalUrl = `/api/proxy/${cleanUrl}`;
    }
  } else {
    // Use direct API URL (for server-side or custom baseURL)
    const defaultBaseURL = envConfig.API_URL;
    finalUrl = baseURL ? `${baseURL}${url}` : `${defaultBaseURL}${url}`;
  }

  const config: AxiosRequestConfig = {
    method,
    url: finalUrl,
    headers: {
      ...headers,
      "Cache-Control": "no-store",
    },
    data: body,
  };

  try {
    const response = await apiInstance.request(config);
    return {
      ...response.data,
      success: true,
    } as APIResponseType;
  } catch (error: any) {
    return (
      (error.response?.data as APIResponseType) || {
        success: false,
        status: 500,
        error: true,
        message: "Network error occurred",
        data: null,
      }
    );
  }
};

/**
 * Standardized API response helper
 */
export const sendAPIResponse = ({
  success,
  status,
  error,
  message,
  data,
}: APIResponseType): APIResponseType => ({
  success,
  status,
  error,
  message,
  data,
});

/**
 * API client for external services
 */
export const createAPIClient = (
  baseURL: string,
  defaultHeaders?: Record<string, string>,
) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
  });

  return {
    get: (url: string, config?: AxiosRequestConfig) =>
      instance.get(url, config),
    post: (url: string, data?: any, config?: AxiosRequestConfig) =>
      instance.post(url, data, config),
    put: (url: string, data?: any, config?: AxiosRequestConfig) =>
      instance.put(url, data, config),
    delete: (url: string, config?: AxiosRequestConfig) =>
      instance.delete(url, config),
    patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
      instance.patch(url, data, config),
  };
};
