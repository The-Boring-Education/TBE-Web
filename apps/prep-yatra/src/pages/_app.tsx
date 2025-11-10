import "@/styles/globals.css"

import { AuthProvider } from "@tbe/auth"
import { useAuth } from "@tbe/auth"
import { PrepYatraGamificationProvider } from "@tbe/components"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

import { Toaster as Sonner } from "@tbe/components"
import { Toaster } from "@tbe/components"
import { TooltipProvider } from "@tbe/components"
import { initGA, trackPageview } from "@tbe/utils"

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

// App Content Component with onboarding logic
const AppContent = ({
    Component,
    pageProps
}: {
    Component: AppProps["Component"]
    pageProps: any
}) => {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const [isClient, setIsClient] = useState(false)
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false)
    const hasCheckedOnboarding = useRef(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        initGA()
        trackPageview(router.asPath)
        const handleRouteChange = (url: string) => trackPageview(url)
        router.events.on("routeChangeComplete", handleRouteChange)
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange)
        }
    }, [router])

    useEffect(() => {
        // Only run on client side
        if (!isClient || isLoading || !isAuthenticated || isCheckingOnboarding)
            return

        // Skip check for public pages
        const publicPages = ["/auth", "/"]
        if (publicPages.includes(router.pathname)) return

        // Skip if already checked
        if (hasCheckedOnboarding.current) return

        const checkOnboardingStatus = async () => {
            if (!user?.email) return

            hasCheckedOnboarding.current = true
            setIsCheckingOnboarding(true)
            try {
                const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(
                    /\/$/,
                    ""
                )
                const resp = await fetch(
                    `${base}/user?email=${encodeURIComponent(user.email)}`
                )
                const json = await resp.json()
                const isOnboarded = json?.data?.prepYatra?.pyOnboarded === true

                if (!isOnboarded) {
                    // Redirect to external onboarding app
                    const onboardingBaseUrl =
                        process.env.NEXT_PUBLIC_ONBOARDING_URL
                    if (onboardingBaseUrl) {
                        const params = new URLSearchParams({
                            userId: user?.id || "",
                            email: user?.email || "",
                            productId: "prepyatra",
                            from: "prepyatra",
                            redirect: `${window.location.origin}/dashboard`
                        })
                        window.location.href = `${onboardingBaseUrl}/?${params.toString()}`
                    }
                }
            } catch (error) {
                console.error("Error checking onboarding:", error)
            } finally {
                setIsCheckingOnboarding(false)
            }
        }

        // Run check only once when landing on protected pages
        void checkOnboardingStatus()
    }, [
        isClient,
        isAuthenticated,
        isLoading,
        router.pathname,
        user?.id,
        isCheckingOnboarding
    ])

    // Show loading spinner while checking onboarding on protected pages
    const publicPages = ["/auth", "/"]
    const isProtectedPage = !publicPages.includes(router.pathname)

    console.log(
        "AppContent render - isAuthenticated:",
        isAuthenticated,
        "user:",
        user,
        "isCheckingOnboarding:",
        isCheckingOnboarding,
        "pathname:",
        router.pathname
    )

    if (isProtectedPage && isAuthenticated && isCheckingOnboarding) {
        console.log("Showing onboarding check spinner")
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
            </div>
        )
    }

    return (
        <>
            <CacheManager />
            <PrepYatraGamificationProvider>
                <Component {...pageProps} />
            </PrepYatraGamificationProvider>
        </>
    )
}

export default function App({
    Component,
    pageProps: { session, ...pageProps }
}: AppProps) {
    const [queryClient] = useState(() => new QueryClient())

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

            <AuthProvider session={session}>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <AppContent
                            Component={Component}
                            pageProps={pageProps}
                        />
                    </TooltipProvider>
                </QueryClientProvider>
            </AuthProvider>
        </>
    )
}
