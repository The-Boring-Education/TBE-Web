'use client'

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { config } from "@/config"
import { getValidUserId } from "@/lib/utils"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading, refreshUserFromBackend } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [hasRefreshed, setHasRefreshed] = useState(false)
    const [refreshingUser, setRefreshingUser] = useState(false)
    const [redirectingToOnboarding, setRedirectingToOnboarding] = useState(false)
    const [isProcessingOnboarding, setIsProcessingOnboarding] = useState(false)

    const cameFromOnboarding = searchParams.get("onboardingComplete") === "true"

    // Handle onboarding redirection and refresh logic
    useEffect(() => {
        if (!loading && user) {
            // Handle onboarding completion
            if (cameFromOnboarding && !hasRefreshed) {
                setRefreshingUser(true)
                
                const refreshUserData = async () => {
                    if (isProcessingOnboarding) return
                    
                    setIsProcessingOnboarding(true)
                    try {
                        await refreshUserFromBackend?.()
                    } catch (err) {
                        // Failed to refresh user after onboarding
                    } finally {
                        setHasRefreshed(true)
                        setRefreshingUser(false)
                        setIsProcessingOnboarding(false)
                    }
                }

                refreshUserData()
                return
            }

            // Check if user needs onboarding
            if (user.isOnboarded === false || user.isOnboarded === undefined) {
                // Only redirect if we haven't just come from onboarding
                if (!cameFromOnboarding) {
                    const validUserId = getValidUserId(user)
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
        loading,
        hasRefreshed,
        cameFromOnboarding,
        router,
        isProcessingOnboarding,
        refreshUserFromBackend
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
    if (user && (user.isOnboarded === false || user.isOnboarded === undefined) && !cameFromOnboarding) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-2xl font-semibold'>Redirecting to onboarding...</div>
            </div>
        )
    }

    return <>{children}</>
}