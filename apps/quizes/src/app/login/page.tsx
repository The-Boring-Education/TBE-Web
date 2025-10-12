"use client"

import { useEffect } from "react"
import { useAuth } from "@tbe/auth"
import { useRouter } from "next/navigation"
import { config } from "@tbe/config/quizes"
import { Brain, Sparkles, Trophy, Users } from "lucide-react"
import { Button } from "@tbe/components/quizes"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@tbe/components/quizes"
import { useToast } from "@tbe/components/quizes"

export default function Login() {
    const { signIn, user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (isAuthenticated && user) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, user, router])

    const handleSignIn = async () => {
        try {
            await signIn("/dashboard")
        } catch (error) {
            console.error("Login failed:", error)
            toast({
                title: "Sign in failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            })
        }
    }

    const features = [
        {
            icon: <Brain className='w-6 h-6' />,
            title: "Smart Learning",
            description: "AI-powered questions tailored to your skill level"
        },
        {
            icon: <Trophy className='w-6 h-6' />,
            title: "Track Progress",
            description: "Monitor your improvement with detailed analytics"
        },
        {
            icon: <Users className='w-6 h-6' />,
            title: "Compete",
            description: "Challenge yourself on the global leaderboard"
        },
        {
            icon: <Sparkles className='w-6 h-6' />,
            title: "Expert Content",
            description: "Curated by industry professionals"
        }
    ]

    return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100'>
            <div className='w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center'>
                {/* Left side - Branding */}
                <div className='space-y-8'>
                    <div>
                        <h1 className='text-5xl font-black mb-2'>Quizes</h1>
                        <p className='text-xl text-gray-600 font-medium'>
                            by The Boring Education
                        </p>
                    </div>

                    <p className='text-2xl font-semibold text-gray-800'>
                        Master tech interviews with confidence
                    </p>

                    <div className='grid grid-cols-2 gap-4'>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className='p-4 bg-white rounded-lg border-2 border-black'>
                                <div className='mb-2'>{feature.icon}</div>
                                <h3 className='font-semibold mb-1'>
                                    {feature.title}
                                </h3>
                                <p className='text-sm text-gray-600'>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side - Login */}
                <Card className='border-2 border-black shadow-lg'>
                    <CardHeader>
                        <CardTitle className='text-2xl font-bold'>
                            Welcome Back
                        </CardTitle>
                        <CardDescription>
                            Sign in to continue your learning journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Button
                            onClick={handleSignIn}
                            disabled={isLoading}
                            className='w-full h-12 text-lg bg-black text-white hover:bg-gray-800 font-semibold border-2 border-black rounded-lg transition-all duration-200'>
                            {isLoading ? (
                                <div className='flex items-center gap-2'>
                                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className='flex items-center gap-2'>
                                    <svg
                                        className='w-5 h-5'
                                        viewBox='0 0 24 24'
                                        fill='currentColor'>
                                        <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                                    </svg>
                                    <span>Continue with GitHub</span>
                                </div>
                            )}
                        </Button>

                        <div className='text-center text-sm text-gray-500'>
                            <p>
                                By signing in, you agree to our{" "}
                                <a
                                    href='#'
                                    className='underline hover:text-gray-900'>
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href='#'
                                    className='underline hover:text-gray-900'>
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
