'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ClientAuthProps {
  children: React.ReactNode
}

export function ClientAuth({ children }: ClientAuthProps) {
  const { user, loading, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authInitialized, setAuthInitialized] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const protectedRoutes = ['/dashboard', '/performance', '/leaderboard', '/quiz']
  const publicRoutes = ['/login', '/']
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // Initialize authentication state
  useEffect(() => {
    if (!loading && !authInitialized) {
      setAuthInitialized(true)
    }
  }, [loading, authInitialized])

  // Handle authentication logic
  useEffect(() => {
    if (!authInitialized || isRedirecting) {
      return
    }

    // If accessing a protected route without authentication
    if (isProtectedRoute && !user) {
      setIsRedirecting(true)
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace('/login')
        setIsRedirecting(false)
      }, 100)
      return
    }

    // If accessing login page while already authenticated
    if (pathname === '/login' && user) {
      setIsRedirecting(true)
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace('/dashboard')
        setIsRedirecting(false)
      }, 100)
      return
    }

    // If accessing root while authenticated, redirect to dashboard
    if (pathname === '/' && user) {
      setIsRedirecting(true)
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace('/dashboard')
        setIsRedirecting(false)
      }, 100)
      return
    }
  }, [user, loading, pathname, router, isProtectedRoute, authInitialized, isRedirecting])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Show loading spinner during auth check for protected routes
  if (loading || (!authInitialized && isProtectedRoute) || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            {isRedirecting ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Don't render protected content if not authenticated
  if (authInitialized && isProtectedRoute && !user) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}