import "./globals.css"

import { AuthProvider } from "@tbe/auth"
import { AnalyticsWrapper } from "@tbe/components"
import { GamificationWrapper } from "@tbe/components/quizes"
import { Toaster } from "@tbe/components/quizes"
import { QueryProvider } from "@tbe/components/quizes"
import type { AppProps } from "next/app"
import { Inter } from "next/font/google"
import { Toaster as Sonner } from "sonner"

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

