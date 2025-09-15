import { config } from "@/config"

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

class APIError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "APIError"
    this.status = status
    this.code = code
  }
}

export class APIClient {
  private baseURL: string

  constructor(baseURL: string = config.API_BASE_URL) {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("quizToken")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    // Ensure endpoint doesn't start with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const fullUrl = `${this.baseURL}/${cleanEndpoint}`
    
    const url = new URL(fullUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return url.toString()
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      let errorCode: string | undefined

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        errorCode = errorData.code
      } catch {
        // If JSON parsing fails, use the default error message
      }

      // Handle 401 Unauthorized
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("quizUser")
        localStorage.removeItem("quizToken")
        window.location.href = "/"
      }

      throw new APIError(errorMessage, response.status, errorCode)
    }

    const data = await response.json()
    return data
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...requestOptions } = options
    const url = this.buildURL(endpoint, params)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        ...requestOptions.headers,
      },
      ...requestOptions,
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {

    const response = await fetch(this.buildURL(endpoint), {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const response = await fetch(this.buildURL(endpoint), {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(this.buildURL(endpoint), {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new APIClient()
export { APIError }