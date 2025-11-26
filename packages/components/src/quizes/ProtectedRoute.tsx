'use client'

import { useAuth } from '@tbe/auth'
import { config } from "@tbe/config/quizes"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [hasRefreshed, setHasRefreshed] = useState(false)
    const [refreshingUser, setRefreshingUser] = useState(false)
    const [redirectingToOnboarding, setRedirectingToOnboarding] = useState(false)
    const [isProcessingOnboarding, setIsProcessingOnboarding] = useState(false)
    const [resolvedUserId, setResolvedUserId] = useState<string | null>(null)
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null)
    const isResolvingRef = useRef(false)

    const cameFromOnboarding = searchParams.get("onboardingComplete") === "true"

    // Helper: Mongo ObjectId check
    const isMongoObjectId = (val?: string): boolean => {
        if (!val) return false
        return /^[a-fA-F0-9]{24}$/.test(val)
    }

    // Resolve DB user id and onboarding status
    useEffect(() => {
        const resolveUser = async () => {
            if (isResolvingRef.current) return
            if (!user?.email && !user?.id) return
            isResolvingRef.current = true
            try {
                if (isMongoObjectId(user?.id)) {
                    setResolvedUserId(user!.id)
                }
                const base = (config.API_BASE_URL || '').replace(/\/$/, '')
                const resp = await fetch(`${base}/user?email=${encodeURIComponent(user!.email!)}`)
                const json = await resp.json()
                const dbId = json?.data?._id
                const apiOnboarded = json?.data?.isOnboarded === true || json?.data?.quiz?.onboarded === true
                setNeedsOnboarding(apiOnboarded ? false : true)
                if (isMongoObjectId(dbId)) setResolvedUserId(dbId)
            } catch (_e) {
                // ignore
            } finally {
                isResolvingRef.current = false
            }
        }

        if (isAuthenticated && !isLoading && user && !resolvedUserId) {
            void resolveUser()
        }
    }, [isAuthenticated, isLoading, user, resolvedUserId])

    // Handle onboarding redirection and refresh logic
    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            // Handle onboarding completion
            if (cameFromOnboarding && !hasRefreshed) {
                setRefreshingUser(true)
                setIsProcessingOnboarding(true)
                setHasRefreshed(true)
                setTimeout(() => {
                    setRefreshingUser(false)
                    setIsProcessingOnboarding(false)
                }, 50)
                return
            }

            // Check if user needs onboarding (via API flag)
            if (needsOnboarding === true) {
                // Only redirect if we haven't just come from onboarding
                if (!cameFromOnboarding) {
                    // Use resolved Mongo _id if available, else abort
                    const candidateId = resolvedUserId || user?.id
                    if (!candidateId || !isMongoObjectId(candidateId)) {
                        // If user object is incomplete, redirect to login to re-authenticate
                        router.push('/login')
                        return
                    }
                    
                    setRedirectingToOnboarding(true)
                    
                    if (!config.ONBOARDING_APP_URL) {
                        // ONBOARDING_APP_URL is not set in config
                        router.push('/login')
                        return
                    }
                    
                    const redirectParams = new URLSearchParams({
                        userId: candidateId,
                        from: "quizapp",
                        redirect: `${window.location.origin}/dashboard?onboardingComplete=true`
                    })

                    const onboardingURL = `${config.ONBOARDING_APP_URL}/?${redirectParams.toString()}`
                    
                    setTimeout(() => {
                        window.location.href = onboardingURL
                    }, 100)
                    return
                }
            }
        }
    }, [
        user,
        isLoading,
        resolvedUserId,
        needsOnboarding,
        hasRefreshed,
        cameFromOnboarding,
        router,
        isProcessingOnboarding
    ])

    // Show loading state while redirecting to onboarding
    if (redirectingToOnboarding) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-2xl font-semibold'>Redirecting to onboarding...</div>
            </div>
        )
    }

    // Show loading state while refreshing user data
    if (refreshingUser) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-2xl font-semibold'>Refreshing user data...</div>
            </div>
        )
    }

    // If user needs onboarding, show loading while redirecting
    if (user && needsOnboarding === true && !cameFromOnboarding) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-2xl font-semibold'>Redirecting to onboarding...</div>
            </div>
        )
    }

    return <>{children}</>
}