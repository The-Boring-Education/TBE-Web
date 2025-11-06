import "./globals.css"

import { AuthProvider } from "@tbe/auth"
import { GamificationWrapper } from "@tbe/components/quizes"
import { Toaster } from "@tbe/components/quizes"
import { Toaster as Sonner } from "sonner"
import { AnalyticsWrapper } from "@tbe/components"
import { QueryProvider } from "@tbe/components/quizes"

import type { AppProps } from "next/app"
import Head from "next/head"

import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
})

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <QueryProvider>
        <AuthProvider>
          <AnalyticsWrapper>
            <GamificationWrapper>
              <div className="min-h-screen bg-background text-foreground">
                <Component {...pageProps} />
              </div>
            </GamificationWrapper>
          </AnalyticsWrapper>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </QueryProvider>
    </div>
  )
}

