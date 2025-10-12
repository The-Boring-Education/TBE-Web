import { useRouter } from "next/router"
import React, { ReactNode, useEffect } from "react"
import { useAuth } from "@tbe/auth"

interface ProtectedRouteProps {
    children: ReactNode
    requireOnboarding?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireOnboarding = false
}) => {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Redirect to auth with callback URL
                router.push(
                    `/auth?callbackUrl=${encodeURIComponent(router.asPath)}`
                )
                return
            }

            if (requireOnboarding && user) {
                // Check if user needs onboarding
                const checkOnboarding = async () => {
                    try {
                        const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/user?email=${user.email}`
                        )
                        const data = await res.json()

                        if (!data?.data?.prepYatra?.pyOnboarded) {
                            // Redirect to external onboarding app
                            const onboardingBaseUrl =
                                process.env.NEXT_PUBLIC_ONBOARDING_URL
                            if (onboardingBaseUrl) {
                                const redirectUrl = `${onboardingBaseUrl}?userId=${user.id}&from=prepyatra&redirect=${encodeURIComponent(window.location.origin + "/dashboard")}`
                                window.location.href = redirectUrl
                            } else {
                                // Fallback to internal onboarding if external URL is not configured
                                router.push("/onboarding")
                            }
                            return
                        }
                    } catch (error) {
                        console.error("Error checking onboarding:", error)
                        // On error, also redirect to external onboarding app
                        const onboardingBaseUrl =
                            process.env.NEXT_PUBLIC_ONBOARDING_URL
                        if (onboardingBaseUrl && user.id) {
                            const redirectUrl = `${onboardingBaseUrl}?userId=${user.id}&from=prepyatra&redirect=${encodeURIComponent(window.location.origin + "/dashboard")}`
                            window.location.href = redirectUrl
                        } else {
                            // Fallback to internal onboarding if external URL is not configured
                            router.push("/onboarding")
                        }
                        return
                    }
                }

                checkOnboarding()
            }
        }
    }, [isLoading, isAuthenticated, user, router, requireOnboarding])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect to auth
    }

    return <>{children}</>
}

export default ProtectedRoute
