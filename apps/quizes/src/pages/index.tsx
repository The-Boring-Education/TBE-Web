import { useAuth } from "@tbe/auth"
import {
    ArrowRight,
    Brain,
    CheckCircle,
    Clock,
    Code,
    Play,
    Target,
    Trophy,
    Users} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState, Fragment } from "react"
import { SEO } from '@tbe/components'
import { getPreFetchProps } from '@tbe/utils'
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants'
import type { PageProps } from '@tbe/interface'

function QuizesClient() {
    "use client"
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()
    const [isRedirecting, setIsRedirecting] = useState(false)

    // Auto-redirect authenticated users
    useEffect(() => {
        if (isLoading) return // Don't redirect while loading

        if (isAuthenticated && user && !isRedirecting) {
            // Redirect to dashboard
            if (user.id) {
                setIsRedirecting(true)
                router.push("/dashboard")
            }
        }
    }, [user, isAuthenticated, isLoading, router, isRedirecting])

    const handleGetStarted = () => {
        if (isAuthenticated) {
            router.push("/dashboard")
        } else {
            router.push("/login")
        }
    }

    return (
        <div className='min-h-screen bg-white text-black'>
            {/* Show loading state while auth is loading */}
            {isLoading && (
                <div className='min-h-screen flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto' />
                        <p className='mt-4 text-lg text-gray-600'>Loading...</p>
                    </div>
                </div>
            )}

            {/* Show redirecting state */}
            {isRedirecting && (
                <div className='min-h-screen flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4444] mx-auto' />
                        <p className='mt-4 text-lg text-gray-600'>
                            Redirecting...
                        </p>
                    </div>
                </div>
            )}

            {/* Show main content only when not loading or redirecting */}
            {!isLoading && !isRedirecting && (
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
                                <h1 className='text-6xl md:text-8xl font-bold text-primary mb-2 leading-none'>
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
                                        <span className='block text-primary'>
                                            Confidence
                                        </span>
                                    </h2>
                                    <p className='text-lg text-gray-700 mb-8 leading-relaxed'>
                                        Practice with carefully curated
                                        questions covering JavaScript, React,
                                        algorithms, and web development. Get
                                        detailed explanations and track your
                                        progress.
                                    </p>
                                    <button
                                        onClick={handleGetStarted}
                                        className='inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:scale-110 hover:bg-primary/90 transition-transform  hover:text-white
                                         duration-200 ease-in-out text-lg'>
                                        Start Practicing
                                        <ArrowRight className='ml-2 w-5 h-5' />
                                    </button>
                                </div>
                                <div className='relative'>
                                    <div className='bg-gray-50 rounded-2xl p-8 border-2 border-primary'>
                                        <div className='space-y-4'>
                                            <div className='flex items-center justify-between'>
                                                <span className='font-semibold'>
                                                    JavaScript Fundamentals
                                                </span>
                                                <CheckCircle className='w-5 h-5 text-primary' />
                                            </div>
                                            <div className='w-full bg-gray-200 rounded-full h-2'>
                                                <div className='bg-primary h-2 rounded-full w-3/4' />
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
                    <div className='bg-white py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-6xl mx-auto'>
                            <div className='text-center mb-16'>
                                <h3 className='text-3xl md:text-4xl font-bold mb-4 text-black'>
                                Everything You Need to Succeed
                                </h3>
                                <p className='text-lg text-[#EF4F48] max-w-2xl mx-auto'>
                                Our comprehensive quiz platform is designed to help you prepare for technical interviews effectively.
                                </p>
                            </div>

                            <div className='grid md:grid-cols-3 gap-8'>
                                <div className='text-center'>
                                <div className='w-16 h-16 border-2 border-[#F6CCCC] bg-white rounded-full flex items-center justify-center mx-auto mb-6'>
                                    <Target className='w-8 h-8 text-[#EF4F48]' />
                                </div>
                                <h4 className='text-xl font-bold mb-4 text-[#EF4F48]'>
                                    Curated Questions
                                </h4>
                                <p className='text-black-600 leading-relaxed'>
                                    Hand-picked questions covering the most important topics for technical interviews.
                                </p>
                                </div>
                                <div className='text-center'>
                                <div className='w-16 h-16 border-2 border-[#F6CCCC] bg-white rounded-full flex items-center justify-center mx-auto mb-6'>
                                    <Clock className='w-8 h-8 text-[#EF4F48]' />
                                </div>
                                <h4 className='text-xl font-bold mb-4 text-[#EF4F48]'>
                                    Timed Practice
                                </h4>
                                <p className='text-black-600 leading-relaxed'>
                                    Practice under time pressure to simulate real interview conditions.
                                </p>
                                </div>
                                <div className='text-center'>
                                <div className='w-16 h-16 border-2 border-[#F6CCCC] bg-white rounded-full flex items-center justify-center mx-auto mb-6'>
                                    <Brain className='w-8 h-8 text-[#EF4F48]' />
                                </div>
                                <h4 className='text-xl font-bold mb-4 text-[#EF4F48]'>
                                    Detailed Explanations
                                </h4>
                                <p className='text-black-600 leading-relaxed'>
                                    Understand the &apos;why&apos; behind every answer with comprehensive explanations.
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className='bg-white py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-4xl mx-auto'>
                            <div className='text-center mb-16'>
                                <h3 className='text-3xl md:text-4xl font-bold mb-4 text-black'>
                                Proven Results
                                </h3>
                                <p className='text-lg text-[#EF4F48]'>
                                Join thousands of developers who have improved their interview skills.
                                </p>
                            </div>

                            <div className='grid md:grid-cols-3 gap-8 text-center'>
                                <div className='border-2 border-black rounded-lg p-8 bg-white shadow'>
                                <div className='flex items-center justify-center mb-4'>
                                    <Code className='w-8 h-8 text-[#EF4F48]' />
                                </div>
                                <div className='text-3xl font-bold mb-2 text-[#EF4F48]'>
                                    50+
                                </div>
                                <div className='text-black'>
                                    Practice Questions
                                </div>
                                </div>
                                <div className='border-2 border-black rounded-lg p-8 bg-white shadow'>
                                <div className='flex items-center justify-center mb-4'>
                                    <Users className='w-8 h-8 text-[#EF4F48]' />
                                </div>
                                <div className='text-3xl font-bold mb-2 text-[#EF4F48]'>
                                    1000+
                                </div>
                                <div className='text-black'>
                                    Active Learners
                                </div>
                                </div>
                                <div className='border-2 border-black rounded-lg p-8 bg-white shadow'>
                                <div className='flex items-center justify-center mb-4'>
                                    <Trophy className='w-8 h-8 text-[#EF4F48]' />
                                </div>
                                <div className='text-3xl font-bold mb-2 text-[#EF4F48]'>
                                    85%
                                </div>
                                <div className='text-black'>
                                    Success Rate
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories Preview */}
                    <div className='bg-white py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-6xl mx-auto'>
                            <div className='text-center mb-16'>
                                <h3 className='text-3xl md:text-4xl font-bold mb-4 text-black'>
                                Choose Your Focus Area
                                </h3>
                                <p className='text-lg text-[#EF4F48]'>
                                Practice questions tailored to specific technologies and concepts.
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
                                    className='bg-white border-2 border-[#F6CCCC] rounded-lg p-6 text-center hover:bg-[#FFF0F0] transition-colors duration-200 shadow-sm'
                                >
                                    <category.icon className='w-8 h-8 mx-auto mb-4 text-[#EF4F48]' />
                                    <h4 className='font-bold text-lg mb-2 text-black'>
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
                    <div className='bg-white py-20'>
                        <div className='container mx-auto px-4'>
                            <div className='max-w-4xl mx-auto text-center'>
                            <h3 className='text-3xl md:text-4xl font-bold mb-6 text-black'>
                                Ready to Ace Your Next Interview?
                            </h3>
                            <p className='text-lg text-[#EF4F48] mb-8 max-w-2xl mx-auto'>
                                Start practicing today and build the confidence you need to succeed in technical interviews.
                            </p>
                            <button
                                onClick={handleGetStarted}
                                className='inline-flex items-center px-8 py-4 bg-[#EF4F48] text-white font-semibold rounded-lg hover:bg-[#ed3030] transition-colors duration-200 text-lg'
                            >
                                <Play className='mr-2 w-5 h-5' />
                                Start Your First Quiz
                            </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <footer className='border-t-2 border-[#F6CCCC] bg-white py-8'>
                        <div className='container mx-auto px-4'>
                            <div className='text-center'>
                            <p className='text-black'>
                                Built with ❤️ By The Boring Education Team
                            </p>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    )
}

const Landing = ({ seoMeta }: PageProps) => {
    return (
        <Fragment>
            <SEO seoMeta={seoMeta} />
            <QuizesClient />
        </Fragment>
    )
}

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.home, appId: "quizes" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Landing

