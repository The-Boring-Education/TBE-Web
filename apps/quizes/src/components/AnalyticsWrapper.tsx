"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { initGA, installGlobalListeners, trackPageview } from "@/lib/analytics"

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        initGA()
        installGlobalListeners()
    }, [])

    useEffect(() => {
        if (!pathname) return
        const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`
        trackPageview(url)
    }, [pathname, searchParams])

    return <>{children}</>
}
