import { useRouter } from "next/router"
import React, { ReactNode, useEffect } from "react"
import { useAuth } from "@tbe/auth"

interface ProtectedRouteProps {
    children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to auth with callback URL
            router.push(
                `/auth?callbackUrl=${encodeURIComponent(router.asPath)}`
            )
        }
    }, [isLoading, isAuthenticated, router])

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
