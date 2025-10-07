import { GoogleOAuthProvider } from "@react-oauth/google"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@tbe/components"
import { PrepYatraGamificationProvider } from "@tbe/components"
import "@/styles/globals.css"
import { initGA, installGlobalListeners, trackPageview } from "@/lib/analytics"

// Cache clearing component
const CacheManager = () => {
    useEffect(() => {
        // Check if we need to clear cache (e.g., after deployment)
        const lastDeployTime = localStorage.getItem("lastDeployTime")
        const currentTime = Date.now()

        // If no last deploy time or it's been more than 1 hour, clear cache
        if (
            !lastDeployTime ||
            currentTime - parseInt(lastDeployTime) > 3600000
        ) {
            if ("caches" in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => {
                        caches.delete(name)
                    })
                })
            }
            localStorage.setItem("lastDeployTime", currentTime.toString())
        }
    }, [])

    return null
}

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const [queryClient] = useState(() => new QueryClient())

    useEffect(() => {
        initGA()
        installGlobalListeners()
        trackPageview(router.asPath)
        const handleRouteChange = (url: string) => trackPageview(url)
        router.events.on("routeChangeComplete", handleRouteChange)
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        }
    }, [router])

    return (
        <>
            <Head>
                <title>PrepYatra - Your Interview Preparation Journey</title>
                <meta
                    name='description'
                    content='Track your interview preparation journey, manage recruiter contacts, and accelerate your career growth with PrepYatra.'
                />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1'
                />
                <link rel='icon' href='/favicon.ico' />

                {/* PWA meta tags */}
                <meta name='theme-color' content='#FF5757' />
                <meta name='apple-mobile-web-app-capable' content='yes' />
                <meta
                    name='apple-mobile-web-app-status-bar-style'
                    content='default'
                />
                <meta name='apple-mobile-web-app-title' content='PrepYatra' />
                <link
                    rel='apple-touch-icon'
                    href='/android-chrome-192x192.png'
                />
                <link rel='manifest' href='/manifest.json' />
            </Head>

            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <CacheManager />
                        <AuthProvider>
                            <PrepYatraGamificationProvider>
                                <Component {...pageProps} />
                            </PrepYatraGamificationProvider>
                        </AuthProvider>
                    </TooltipProvider>
                </QueryClientProvider>
            </GoogleOAuthProvider>
        </>
    )
}
