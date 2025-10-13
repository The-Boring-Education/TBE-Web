'use client'

import React, { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@tbe/auth"
import { config } from "../config"

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

    // Helper: check 24-char hex ObjectId
    const isMongoObjectId = (val?: string): boolean => {
        if (!val) return false
        return /^[a-fA-F0-9]{24}$/.test(val)
    }

    // Resolve MongoDB userId once (from session id or via API by email)
    useEffect(() => {
        const resolveUserId = async () => {
            if (isResolvingRef.current) return
            if (!user?.email && !user?.id) return
            isResolvingRef.current = true
            try {
                if (isMongoObjectId(user?.id)) {
                    setResolvedUserId(user!.id)
                    return
                }
                // Fallback: fetch by email to get _id
                const base = (config.API_BASE_URL || '').replace(/\/$/, '')
                const resp = await fetch(`${base}/user?email=${encodeURIComponent(user!.email!)}`)
                const json = await resp.json()
                const dbId = json?.data?._id
                const apiOnboarded = json?.data?.isOnboarded === true || json?.data?.quiz?.onboarded === true
                setNeedsOnboarding(apiOnboarded ? false : true)
                if (isMongoObjectId(dbId)) {
                    setResolvedUserId(dbId)
                }
            } catch (e) {
                // ignore; will retry on next render if needed
            } finally {
                isResolvingRef.current = false
            }
        }

        if (isAuthenticated && !isLoading && user && !resolvedUserId) {
            void resolveUserId()
        }
    }, [isAuthenticated, isLoading, user, resolvedUserId])

    // Handle onboarding redirection and refresh logic
    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            // Handle onboarding completion
            if (cameFromOnboarding && !hasRefreshed) {
                // No explicit refresh method in new auth; do a soft reload once
                if (!isProcessingOnboarding) {
                    setIsProcessingOnboarding(true)
                    setHasRefreshed(true)
                    setRefreshingUser(true)
                    setTimeout(() => {
                        setRefreshingUser(false)
                        setIsProcessingOnboarding(false)
                    }, 100)
                }
                return
            }

            // Check if user needs onboarding (API derived)
            if (needsOnboarding === true) {
                // Only redirect if we haven't just come from onboarding
                if (!cameFromOnboarding) {
                    const candidateId = resolvedUserId || user?.id
                    const validUserId = candidateId && isMongoObjectId(candidateId) ? candidateId : null
                    if (!validUserId) {
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
                        userId: validUserId,
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