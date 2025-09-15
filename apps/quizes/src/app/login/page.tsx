'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { config } from "@/config"
import { getValidUserId } from "@/lib/utils"
import { Brain, Sparkles, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function Login() {
    const { signInWithGoogle, user, loading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            const validUserId = getValidUserId(user)
            if (!validUserId) {
                // If user object is incomplete, stay on login page
                return
            }
            
            if (user.isOnboarded) {
                router.push("/dashboard")
            } else {
                const params = new URLSearchParams({
                    userId: validUserId,
                    from: "quizapp",
                    redirect:
                        window.location.origin +
                        "/dashboard?onboardingComplete=true"
                })

                window.location.href = `${
                    config.ONBOARDING_APP_URL
                }/?${params.toString()}`
            }
        }
    }, [user, router])

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle()
            // Navigation will be handled by the useEffect above
            // Note: The actual success/error handling is now done in AuthContext callbacks
        } catch (error) {
            console.error("Login failed:", error)
            toast({
                title: "Sign in failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        }
    }

    const features = [
        {
            icon: <Brain className="w-5 h-5 text-blue-500" />,
            title: "Smart Questions",
            description: "Curated questions covering all major tech topics"
        },
        {
            icon: <Trophy className="w-5 h-5 text-yellow-500" />,
            title: "Track Progress",
            description: "Monitor your improvement with detailed analytics"
        },
        {
            icon: <Users className="w-5 h-5 text-green-500" />,
            title: "Community",
            description: "Join thousands of learners on their journey"
        }
    ]

    if (loading) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4'>
            <div className='max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
                {/* Left Side - Branding & Features */}
                <div className='text-center lg:text-left animate-slide-in-left'>
                    <div className='flex items-center justify-center lg:justify-start mb-6'>
                        <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4 animate-float'>
                            <Brain className='w-8 h-8 text-primary-foreground' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground'>
                                The Boring Quizes
                            </h1>
                            <p className='text-muted-foreground text-sm'>
                                by The Boring Education
                            </p>
                        </div>
                    </div>

                    <h2 className='text-4xl lg:text-5xl font-bold text-foreground mb-4'>
                        Master Tech Interviews{" "}
                        <span className='text-primary'>with Confidence</span>
                    </h2>
                    
                    <p className='text-lg text-muted-foreground mb-8'>
                        Practice with carefully curated questions covering JavaScript, React, 
                        algorithms, and web development fundamentals.
                    </p>

                    {/* Features */}
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
                        {features.map((feature, index) => (
                            <Card 
                                key={index} 
                                className='glass border-primary/20 animate-fade-in'
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <CardContent className='p-4 text-center'>
                                    <div className='flex justify-center mb-2'>
                                        {feature.icon}
                                    </div>
                                    <h3 className='font-semibold text-sm text-foreground mb-1'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-xs text-muted-foreground'>
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className='text-center lg:text-left'>
                        <p className='text-sm text-muted-foreground flex items-center justify-center lg:justify-start'>
                            <Sparkles className='w-4 h-4 mr-2 text-yellow-500' />
                            Join thousands of learners improving their skills
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Card */}
                <div className='flex justify-center lg:justify-end animate-slide-in-right'>
                    <Card className='w-full max-w-md glass border-primary/20'>
                        <CardHeader className='text-center'>
                            <CardTitle className='text-2xl font-bold text-foreground'>
                                Welcome Back! 👋
                            </CardTitle>
                            <CardDescription>
                                Sign in to continue your learning journey
                            </CardDescription>
                        </CardHeader>

                        <CardContent className='space-y-6'>
                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className='w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                            >
                                {loading ? (
                                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3'></div>
                                ) : (
                                    <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                                        <path
                                            fill='#4285F4'
                                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                        />
                                        <path
                                            fill='#34A853'
                                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                        />
                                        <path
                                            fill='#FBBC05'
                                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                        />
                                        <path
                                            fill='#EA4335'
                                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                        />
                                        <path fill='none' d='M1 1h22v22H1z' />
                                    </svg>
                                )}
                                {loading ? "Signing in..." : "Continue with Google"}
                            </Button>

                            <div className='text-center text-xs text-muted-foreground'>
                                <p>By signing in, you agree to our</p>
                                <p className='mt-1'>
                                    <a href='#' className='text-primary hover:underline'>
                                        Terms of Service
                                    </a>
                                    {" & "}
                                    <a href='#' className='text-primary hover:underline'>
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}