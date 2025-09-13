export interface APIMakeRequestProps {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    url: string
    headers?: Record<string, string>
    body?: any
    baseURL?: string
}

export interface APIResponseType {
    status: number
    error: boolean
    message: string
    data?: any
}

export interface DatabaseQueryResponseType {
    data?: any
    error?: string
}
