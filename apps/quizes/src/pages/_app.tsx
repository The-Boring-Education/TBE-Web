import "./globals.css"

import { AuthProvider } from "@tbe/auth"
import { AnalyticsWrapper } from "@tbe/components"
import { GamificationWrapper } from "@tbe/components/quizes"
import { Toaster } from "@tbe/components/quizes"
import { QueryProvider } from "@tbe/components/quizes"
import type { AppProps } from "next/app"
import { Toaster as Sonner } from "sonner"
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
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

