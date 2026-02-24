
import { useAuth } from "@tbe/auth"
import { Footer, LoginCardNew, Navbar } from "@tbe/components"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Login = () => {
    const router = useRouter()
    const { signIn, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        // Redirect if already authenticated
        if (!isLoading && isAuthenticated) {
            const callbackUrl =
                (router.query.callbackUrl as string) || "/dashboard"
            router.replace(callbackUrl)
        }
    }, [isAuthenticated, isLoading, router])

    const _handleSignIn = () => {
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
        <div className='min-h-screen flex flex-col bg-lightBG'>
            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <LoginCardNew variant='dsayatra' />
            </div>
        </div>
    )
}

export default Login
