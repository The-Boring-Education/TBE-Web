import { useAuth } from "@tbe/auth"
import { Footer,LoginCardNew, Navbar } from "@tbe/components"
import {InstallButton} from "@tbe/components"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Auth = () => {
    const router = useRouter()
    const { signIn, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        // Redirect if already authenticated - let _app.tsx handle onboarding check
        if (!isLoading && isAuthenticated) {
            const callbackUrl =
                (router.query.callbackUrl as string) || "/dashboard"
            router.replace(callbackUrl)
        }
    }, [isAuthenticated, isLoading, router])

    const handleSignIn = () => {
        const callbackUrl = (router.query.callbackUrl as string) || "/dashboard"
        signIn(callbackUrl)
    }

    // Show nothing while checking or redirecting
    if (isAuthenticated) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
            </div>
        )
    }

    return (
        <div className='min-h-screen flex items-center justify-center  relative overflow-hidden bg-lightBG'>
            {/* Background Animation Elements */}
            <Navbar variant='prepyatra' />  
            <div className="mt-8">
                <LoginCardNew variant='prepyatra' />
                <Footer  />
            </div>
            <InstallButton />
        </div>
    )
}

export default Auth
