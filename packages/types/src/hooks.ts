export interface TrackEventProps {
    action: string
    category?: string
    label?: string
    value?: number
    [key: string]: unknown
}

export interface UseApiOptions {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    staleTime?: number
    cacheTime?: number
}

export interface UseApiResponse<T = any> {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    mutate: (params: any) => Promise<void>
}

export interface GamificationAction {
    type: string
    points: number
    message: string
    metadata?: Record<string, any>
}

export interface MediaQueryHook {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isLarge: boolean
}
