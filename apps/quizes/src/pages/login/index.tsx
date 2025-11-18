import { useAuth } from "@tbe/auth"
import { Button } from "@tbe/components/quizes"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@tbe/components/quizes"
import { useToast } from "@tbe/components/quizes"
import { Brain, Sparkles, Trophy, Users } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect } from "react"

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
                        Master tech interviews with 
                         <span className='block text-primary'>
                            Confidence
                        </span>
                    </p>
                    

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {features.map((feature, idx) => (
                            <div
                            key={idx}
                            className={`p-4 rounded-lg border-2 border-[#FF5757] bg-white text-left 
                                transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#FF5757]/20`}
                            >
                            <div className="text-2xl mb-2 text-[#FF5757]">{feature.icon}</div>
                            <div className="font-semibold text-lg mb-1 text-contentLight">{feature.title}</div>
                            <div className="text-sm opacity-80">{feature.description}</div>
                            </div>
                        ))}
                    </div>


                </div>

                {/* Right side - Login */}
                <Card className='border-2 border-primary shadow-lg'>
                    <CardHeader>
                        <CardTitle className='text-2xl font-bold'>
                            Welcome <span className='text-primary'>Back</span>
                        </CardTitle>
                        <CardDescription>
                            Sign in to continue your learning journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Button
                            onClick={handleSignIn}
                            disabled={isLoading}
                            className="w-full h-12 text-lg bg-primary text-white hover:bg-primary font-semibold border-2 border-primary rounded-lg
                                transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
                            >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-white">
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span>Continue with Google</span>
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
