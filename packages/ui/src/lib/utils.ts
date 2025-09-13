import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Utility functions migrated from original project
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>): void => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function memoize<T extends (...args: unknown[]) => ReturnType<T>>(
    fn: T,
    getKey?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, ReturnType<T>>()

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = getKey ? getKey(...args) : JSON.stringify(args)

        if (cache.has(key)) {
            return cache.get(key)!
        }

        const result = fn(...args)
        cache.set(key, result)
        return result
    }) as T
}

export function createIntersectionObserver(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
): IntersectionObserver {
    if (typeof IntersectionObserver === "undefined") {
        throw new Error(
            "IntersectionObserver is not supported in this environment"
        )
    }

    return new IntersectionObserver(callback, {
        rootMargin: "0px",
        threshold: 0.1,
        ...options
    })
}

export function preloadResource(href: string, as: string = "script") {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = href
    link.as = as
    document.head.appendChild(link)
}

export function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}
