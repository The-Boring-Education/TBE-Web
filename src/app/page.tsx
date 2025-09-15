'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { config } from "@/config"
import { getValidUserId } from "@/lib/utils"
import {
    Play,
    Brain,
    Clock,
    Target,
    CheckCircle,
    ArrowRight,
    Code,
    Users,
    Trophy
} from "lucide-react"

export default function Landing() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [isRedirecting, setIsRedirecting] = useState(false)

    // Auto-redirect authenticated users
    useEffect(() => {
        if (loading) return // Don't redirect while loading
        
        if (user && !isRedirecting) {
            const validUserId = getValidUserId(user)
            
            if (!validUserId) {
                // Clear the incomplete user data to prevent infinite loops
                localStorage.removeItem("quizUser")
                localStorage.removeItem("quizToken")
                // If user object is incomplete, redirect to login to re-authenticate
                setIsRedirecting(true)
                setTimeout(() => {
                    router.push("/login")
                }, 100)
                return
            }
            
            if (user.isOnboarded) {
                setIsRedirecting(true)
                setTimeout(() => {
                    router.push("/dashboard")
                }, 100)
            } else {
                // Redirect to external onboarding app
                setIsRedirecting(true)
                const params = new URLSearchParams({
                    userId: validUserId,
                    from: "quizapp",
                    redirect: `${window.location.origin}/dashboard?onboardingComplete=true`
                })
                
                const onboardingURL = `${config.ONBOARDING_APP_URL}/?${params.toString()}`
                setTimeout(() => {
                    window.location.href = onboardingURL
                }, 100)
            }
        }
    }, [user, loading, router, isRedirecting])

    const handleGetStarted = () => {
        if (user && !isRedirecting) {
            const validUserId = getValidUserId(user)
            
            if (!validUserId) {
                // Clear the incomplete user data to prevent infinite loops
                localStorage.removeItem("quizUser")
                localStorage.removeItem("quizToken")
                // If user object is incomplete, redirect to login to re-authenticate
                setIsRedirecting(true)
                setTimeout(() => {
                    router.push("/login")
                }, 100)
                return
            }
            
            if (user.isOnboarded) {
                setIsRedirecting(true)
                setTimeout(() => {
                    router.push("/dashboard")
                }, 100)
            } else {
                // Redirect to external onboarding app
                setIsRedirecting(true)
                const params = new URLSearchParams({
                    userId: validUserId,
                    from: "quizapp",
                    redirect: `${window.location.origin}/dashboard?onboardingComplete=true`
                })
                
                const onboardingURL = `${config.ONBOARDING_APP_URL}/?${params.toString()}`
                setTimeout(() => {
                    window.location.href = onboardingURL
                }, 100)
            }
        } else {
            router.push("/login")
        }
    }

    return (
        <div className='min-h-screen bg-white text-black'>
            {/* Show loading state while auth is loading */}
            {loading && (
                <div className='min-h-screen flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto'></div>
                        <p className='mt-4 text-lg text-gray-600'>Loading...</p>
                    </div>
                </div>
            )}
            
            {/* Show redirecting state */}
            {isRedirecting && (
                <div className='min-h-screen flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto'></div>
                        <p className='mt-4 text-lg text-gray-600'>Redirecting...</p>
                    </div>
                </div>
            )}
            
            {/* Show main content only when not loading or redirecting */}
            {!loading && !isRedirecting && (
                <>
                    {/* Hero Section */}
                    <div className='container mx-auto px-4 py-16'>
                        <div className='max-w-6xl mx-auto'>
                            {/* Logo and Branding */}
                            <div className='mb-16'>
                                <div className='flex items-center mb-4'>
                                    <div className='w-12 h-12 bg-black rounded-lg flex items-center justify-center mr-4'>
                                        <Brain className='w-6 h-6 text-white' />
                                    </div>
                                </div>
                                <h1 className='text-6xl md:text-8xl font-black mb-2 leading-none'>
                                    Quizes
                                </h1>
                                <p className='text-xl md:text-2xl text-gray-600 font-medium'>
                                    by The Boring Education
                                </p>
                            </div>

                            {/* Value Proposition */}
                            <div className='grid lg:grid-cols-2 gap-16 items-center mb-20'>
                                <div>
                                    <h2 className='text-4xl md:text-5xl font-bold mb-6 leading-tight'>
                                        Master Tech Interviews with
                                        <span className='block text-gray-600'>
                                            Confidence
                                        </span>
                                    </h2>
                                    <p className='text-lg text-gray-700 mb-8 leading-relaxed'>
                                        Practice with carefully curated questions
                                        covering JavaScript, React, algorithms, and web
                                        development. Get detailed explanations and track
                                        your progress.
                                    </p>
                                    <button
                                        onClick={handleGetStarted}
                                        className='inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 text-lg'>
                                        Start Practicing
                                        <ArrowRight className='ml-2 w-5 h-5' />
                                    </button>
                                </div>
                                <div className='relative'>
                                    <div className='bg-gray-50 rounded-2xl p-8 border-2 border-black'>
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-between'>
                                                <span className='font-semibold'>
                                                    JavaScript Fundamentals
                                                </span>
                                                <CheckCircle className='w-5 h-5 text-black' />
                                            </div>
                                            <div className='w-full bg-gray-200 rounded-full h-2'>
                                                <div className='bg-black h-2 rounded-full w-3/4'></div>
                                            </div>
                                            <div className='text-sm text-gray-600'>
                                                15 questions completed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className='bg-gray-50 py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-6xl mx-auto'>
                                <div className='text-center mb-16'>
                                    <h3 className='text-3xl md:text-4xl font-bold mb-4'>
                                        Everything You Need to Succeed
                                    </h3>
                                    <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                                        Our comprehensive quiz platform is designed to
                                        help you prepare for technical interviews
                                        effectively.
                                    </p>
                                </div>

                                <div className='grid md:grid-cols-3 gap-8'>
                                    <div className='text-center'>
                                        <div className='w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6'>
                                            <Target className='w-8 h-8 text-white' />
                                        </div>
                                        <h4 className='text-xl font-bold mb-4'>
                                            Curated Questions
                                        </h4>
                                        <p className='text-gray-600 leading-relaxed'>
                                            Hand-picked questions covering the most
                                            important topics for technical interviews.
                                        </p>
                                    </div>

                                    <div className='text-center'>
                                        <div className='w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6'>
                                            <Clock className='w-8 h-8 text-white' />
                                        </div>
                                        <h4 className='text-xl font-bold mb-4'>
                                            Timed Practice
                                        </h4>
                                        <p className='text-gray-600 leading-relaxed'>
                                            Practice under time pressure to simulate
                                            real interview conditions.
                                        </p>
                                    </div>

                                    <div className='text-center'>
                                        <div className='w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6'>
                                            <Brain className='w-8 h-8 text-white' />
                                        </div>
                                        <h4 className='text-xl font-bold mb-4'>
                                            Detailed Explanations
                                        </h4>
                                        <p className='text-gray-600 leading-relaxed'>
                                            Understand the &apos;why&apos; behind every answer
                                            with comprehensive explanations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className='py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-4xl mx-auto'>
                                <div className='text-center mb-16'>
                                    <h3 className='text-3xl md:text-4xl font-bold mb-4'>
                                        Proven Results
                                    </h3>
                                    <p className='text-lg text-gray-600'>
                                        Join thousands of developers who have improved
                                        their interview skills.
                                    </p>
                                </div>

                                <div className='grid md:grid-cols-3 gap-8 text-center'>
                                    <div className='border-2 border-black rounded-lg p-8'>
                                        <div className='flex items-center justify-center mb-4'>
                                            <Code className='w-8 h-8 text-black' />
                                        </div>
                                        <div className='text-3xl font-bold mb-2'>
                                            50+
                                        </div>
                                        <div className='text-gray-600'>
                                            Practice Questions
                                        </div>
                                    </div>

                                    <div className='border-2 border-black rounded-lg p-8'>
                                        <div className='flex items-center justify-center mb-4'>
                                            <Users className='w-8 h-8 text-black' />
                                        </div>
                                        <div className='text-3xl font-bold mb-2'>
                                            1000+
                                        </div>
                                        <div className='text-gray-600'>
                                            Active Learners
                                        </div>
                                    </div>

                                    <div className='border-2 border-black rounded-lg p-8'>
                                        <div className='flex items-center justify-center mb-4'>
                                            <Trophy className='w-8 h-8 text-black' />
                                        </div>
                                        <div className='text-3xl font-bold mb-2'>
                                            85%
                                        </div>
                                        <div className='text-gray-600'>
                                            Success Rate
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories Preview */}
                    <div className='bg-gray-50 py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-6xl mx-auto'>
                                <div className='text-center mb-16'>
                                    <h3 className='text-3xl md:text-4xl font-bold mb-4'>
                                        Choose Your Focus Area
                                    </h3>
                                    <p className='text-lg text-gray-600'>
                                        Practice questions tailored to specific
                                        technologies and concepts.
                                    </p>
                                </div>

                                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                                    {[
                                        {
                                            name: "JavaScript",
                                            questions: "15 questions",
                                            icon: Code
                                        },
                                        {
                                            name: "React",
                                            questions: "12 questions",
                                            icon: Target
                                        },
                                        {
                                            name: "Algorithms",
                                            questions: "10 questions",
                                            icon: Brain
                                        },
                                        {
                                            name: "Web Dev",
                                            questions: "8 questions",
                                            icon: Clock
                                        }
                                    ].map((category, index) => (
                                        <div
                                            key={index}
                                            className='bg-white border-2 border-black rounded-lg p-6 text-center hover:bg-gray-50 transition-colors duration-200'>
                                            <category.icon className='w-8 h-8 mx-auto mb-4 text-black' />
                                            <h4 className='font-bold text-lg mb-2'>
                                                {category.name}
                                            </h4>
                                            <p className='text-gray-600 text-sm'>
                                                {category.questions}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className='py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-4xl mx-auto text-center'>
                                <h3 className='text-3xl md:text-4xl font-bold mb-6'>
                                    Ready to Ace Your Next Interview?
                                </h3>
                                <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto'>
                                    Start practicing today and build the confidence you
                                    need to succeed in technical interviews.
                                </p>
                                <button
                                    onClick={handleGetStarted}
                                    className='inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200 text-lg'>
                                    <Play className='mr-2 w-5 h-5' />
                                    Start Your First Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <footer className='border-t-2 border-black py-8'>
                <div className='container mx-auto px-4'>
                    <div className='text-center'>
                        <p className='text-gray-600'>
                            Built with ❤️ By The Boring Education Team
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}