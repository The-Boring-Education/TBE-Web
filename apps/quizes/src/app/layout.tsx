'use client'

import { Inter } from 'next/font/google'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClientAuth } from '@/components/ClientAuth'
import { GamificationWrapper } from '@/components/GamificationWrapper'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from 'sonner'
import './globals.css'
import { useEffect } from 'react'
import { initGA, installGlobalListeners, trackPageview } from '@/lib/analytics'
import { usePathname, useSearchParams } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initGA()
    installGlobalListeners()
  }, [])

  useEffect(() => {
    if (!pathname) return
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
    trackPageview(url)
  }, [pathname, searchParams])
  return (
    <html lang="en">
      <head>
        <title>The Boring Quizes - Master Tech Interviews</title>
        <meta name="description" content="Master tech interviews with confidence. Practice with carefully curated questions covering JavaScript, React, algorithms, and web development." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Boring Quizes" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ClientAuth>
              <GamificationWrapper>
                <div className="min-h-screen bg-background text-foreground">
                  {children}
                </div>
              </GamificationWrapper>
            </ClientAuth>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}