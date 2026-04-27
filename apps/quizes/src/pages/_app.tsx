import "@tbe/components/styles/common.css";
import "./globals.css";

import { AuthProvider } from "@tbe/auth";
import { AnalyticsWrapper } from "@tbe/components";
import { GamificationWrapper } from "@tbe/components/quizes";
import { Toaster } from "@tbe/components/quizes";
import { QueryProvider } from "@tbe/components/quizes";
import { ThemeProvider } from "@tbe/hooks";
import type { AppProps } from "next/app";
import { Toaster as Sonner } from "sonner";
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <AnalyticsWrapper>
              <GamificationWrapper>
                <div className="min-h-screen bg-background text-foreground">
                  <Component {...pageProps} />
                </div>
              </GamificationWrapper>
            </AnalyticsWrapper>
            <Toaster />
            <Sonner />
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </div>
  );
}
