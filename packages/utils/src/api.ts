import axios, { type AxiosRequestConfig } from "axios"
import { envConfig } from "@tbe/constants"
export interface APIMakeRequestProps {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    url: string
    headers?: Record<string, string>
    body?: any
    baseURL?: string
    data?: any
}

export interface APIResponseType {
    success?: boolean
    status?: number | boolean
    error?: any
    message?: string
    data?: any
}

const apiInstance = axios.create()

/**
 * Universal API request utility for TBE apps
 * Supports different base URLs for different services
 */
export const sendRequest = async ({
    method = "GET",
    url,
    headers,
    body,
    baseURL
}: APIMakeRequestProps): Promise<APIResponseType> => {
    const defaultBaseURL = envConfig.BASE_API_APP_URL || 'http://localhost:3004/api/v1';
    const config: AxiosRequestConfig = {
        method,
        url: baseURL ? `${baseURL}${url}` : `${defaultBaseURL}${url}`,
        headers: {
            ...headers,
            cache: "no-store"
        },
        data: body
    }

    try {
        const response = await apiInstance.request(config)
        return {
            ...response.data,
            success: true
        } as APIResponseType
    } catch (error: any) {
        return (
            (error.response?.data as APIResponseType) || {
                success: false,
                status: 500,
                error: true,
                message: "Network error occurred",
                data: null
            }
        )
    }
}

/**
 * Standardized API response helper
 */
export const sendAPIResponse = ({
    success,
    status,
    error,
    message,
    data
}: APIResponseType): APIResponseType => ({
    success,
    status,
    error,
    message,
    data
})

/**
 * API client for external services
 */
export const createAPIClient = (
    baseURL: string,
    defaultHeaders?: Record<string, string>
) => {
    const instance = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
            ...defaultHeaders
        }
    })

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
            instance.patch(url, data, config)
    }
}
