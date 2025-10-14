import { useAuth } from "@tbe/auth"
import { FileText, Github, Loader2 } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export default function AuthPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading, signIn } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const { error } = router.query

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/builder")
        }
    }, [isAuthenticated, router])

    const handleGitHubSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn("/builder")
        } catch (error) {
            console.error("Sign in error:", error)
            setIsLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'>
                <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
            </div>
        )
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4'>
            <Card className='w-full max-w-md shadow-xl'>
                <CardHeader className='space-y-4 text-center'>
                    <div className='mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center'>
                        <FileText className='w-8 h-8 text-white' />
                    </div>
                    <CardTitle className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                        Welcome to Resume Yatra
                    </CardTitle>
                    <CardDescription className='text-base'>
                        Sign in to save your progress and build your perfect
                        resume
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {error && (
                        <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center'>
                            {error === "OAuthAccountNotLinked"
                                ? "This email is already associated with another account."
                                : "An error occurred during sign in. Please try again."}
                        </div>
                    )}

                    <Button
                        onClick={handleGitHubSignIn}
                        disabled={isLoading}
                        className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold transition-all duration-300 hover:scale-105'
                        size='lg'>
                        {isLoading ? (
                            <>
                                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Github className='w-5 h-5 mr-2' />
                                Continue with GitHub
                            </>
                        )}
                    </Button>

                    <div className='space-y-2 pt-4'>
                        <p className='text-xs text-center text-gray-500'>
                            By signing in, you agree to our Terms of Service and
                            Privacy Policy
                        </p>
                        <div className='flex items-center justify-center gap-4 text-xs text-gray-500'>
                            <span>✓ Auto-save progress</span>
                            <span>✓ Access from anywhere</span>
                            <span>✓ Track your score</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Force SSR for this page
export async function getServerSideProps() {
    return {
        props: {}
    }
}
