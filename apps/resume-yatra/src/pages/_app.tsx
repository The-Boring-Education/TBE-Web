import "@/styles/globals.css"

import { AuthProvider } from "@tbe/auth"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { QueryClient, QueryClientProvider } from "react-query"

import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function App({
    Component,
    pageProps: { session, ...pageProps }
}: AppProps) {
    const router = useRouter()
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1
                    }
                }
            })
    )

    return (
        <>
            <Head>
                <title>Resume Yatra - Build Your Perfect Resume</title>
                <meta
                    name='description'
                    content='Build a professional resume with guided steps, best practices, and expert tips. Resume Yatra helps you create a resume that gets you hired.'
                />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1'
                />
                <link rel='icon' href='/favicon.ico' />

                {/* Open Graph / Social Media */}
                <meta property='og:type' content='website' />
                <meta
                    property='og:title'
                    content='Resume Yatra - Build Your Perfect Resume'
                />
                <meta
                    property='og:description'
                    content='Build a professional resume with guided steps and expert tips.'
                />

                {/* PWA meta tags */}
                <meta name='theme-color' content='#8b5cf6' />
                <meta name='apple-mobile-web-app-capable' content='yes' />
                <meta
                    name='apple-mobile-web-app-status-bar-style'
                    content='default'
                />
                <meta
                    name='apple-mobile-web-app-title'
                    content='Resume Yatra'
                />
            </Head>

            <AuthProvider session={session}>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <Component {...pageProps} />
                    </TooltipProvider>
                </QueryClientProvider>
            </AuthProvider>
        </>
    )
}
