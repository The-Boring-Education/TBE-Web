import {
    ArrowRight,
    CheckCircle,
    Gift,
    Sparkles,
    Star,
    Target,
    Users,
    X,
    Zap} from "lucide-react"
import { useEffect,useState } from "react"
import { toast } from "sonner"

import { useUser } from "../contexts/useAuth"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "../ui/popover"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface SubscriptionInterestPopoverProps {
    className?: string
}

const SubscriptionInterestPopover = ({
    className = ""
}: SubscriptionInterestPopoverProps) => {
    const { user, isAuthenticated } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const [isInterested, setIsInterested] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [isOpen, setIsOpen] = useState(false)

    // Auto-open after a delay when component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isVisible && isAuthenticated) {
                setIsOpen(true)
            }
        }, 2000) // 2 seconds after page load

        return () => clearTimeout(timer)
    }, [isVisible, isAuthenticated])

    // Hide popover permanently for session
    useEffect(() => {
        const hidden = sessionStorage.getItem("py-subscription-popover-hidden")
        if (hidden) {
            setIsVisible(false)
        }
    }, [])

    const subscriptionFeatures = [
        {
            icon: Star,
            text: "Build Your Skills & Track Progress",
            color: "text-yellow-500"
        },
        {
            icon: Target,
            text: "Find What's Missing in Your Resume",
            color: "text-blue-500"
        },
        {
            icon: Users,
            text: "On-Demand Interview Prep",
            color: "text-green-500"
        },
        {
            icon: Gift,
            text: "Auto Cold Mailing to Recruiters",
            color: "text-red-500"
        },
        {
            icon: Zap,
            text: "Lifetime Access to PrepYatra",
            color: "text-purple-500"
        }
    ]

    const handleInterestClick = async () => {
        if (!isAuthenticated || !user?.id) {
            toast.error("Please login to show your interest")
            return
        }

        if (isInterested) {
            toast.success("You're already on our interest list!")
            return
        }

        setIsLoading(true)
        try {
            // Call the webapp API from prep-yatra
            const response = await fetch(`${API_BASE_URL}/user/interest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    eventType: "PREPYATRA_SUBSCRIPTION",
                    eventDescription:
                        "User interested in PrepYatra subscription from dashboard popover",
                    metadata: {
                        page: "dashboard",
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent
                    },
                    source: "PREPYATRA"
                })
            })

            const data = await response.json()

            if (response.ok && data.status) {
                setIsInterested(true)
                toast.success(
                    "Thanks! We'll notify you when subscription launches 🚀"
                )
                // Auto-close after success
                setTimeout(() => {
                    setIsOpen(false)
                    handleDismiss()
                }, 2000)
            } else {
                toast.error("Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error("Error showing interest:", error)
            toast.error("Failed to register interest. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setIsOpen(false)
        sessionStorage.setItem("py-subscription-popover-hidden", "true")
    }

    if (!isVisible || !isAuthenticated) {
        return null
    }

    return (
        <div className={`${className}`}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant='outline'
                        className='bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 shadow-lg animate-pulse'
                        onClick={() => setIsOpen(true)}>
                        <Sparkles className='h-4 w-4 mr-2' />
                        Premium Coming Soon
                        <Badge className='ml-2 bg-yellow-400 text-black text-xs'>
                            NEW
                        </Badge>
                    </Button>
                </PopoverTrigger>

                <PopoverContent className='w-96 p-0 border-0 shadow-2xl bg-white animate-in slide-in-from-right-4 duration-300'>
                    <div className='relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden'>
                        {/* Header */}
                        <div className='p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden'>
                            {/* Background Animation */}
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 animate-pulse' />

                            <button
                                onClick={handleDismiss}
                                className='absolute top-4 right-4 text-white/80 hover:text-white transition-all duration-200 hover:scale-110 z-10'
                                aria-label='Close premium features popup'>
                                <X className='h-5 w-5' />
                            </button>

                            <div className='relative z-10'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <Sparkles className='h-6 w-6 animate-spin' />
                                    <span className='font-bold text-lg'>
                                        PrepYatra Premium
                                    </span>
                                    <Badge className='bg-yellow-400 text-black text-xs font-medium animate-bounce'>
                                        Coming Soon
                                    </Badge>
                                </div>
                                <p className='text-blue-100 text-sm'>
                                    🚀 Transform your job search with premium
                                    features
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className='p-6'>
                            <h3 className='font-semibold text-gray-800 mb-4 text-center'>
                                What's Coming for You:
                            </h3>

                            <div className='space-y-3 mb-6'>
                                {subscriptionFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-3 p-3 rounded-lg hover:bg-white/70 transition-all duration-200 hover:scale-[1.02] cursor-pointer group'
                                        style={{
                                            animationDelay: `${index * 100}ms`
                                        }}>
                                        <div className='p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow'>
                                            <feature.icon
                                                className={`h-4 w-4 ${feature.color} group-hover:scale-110 transition-transform`}
                                            />
                                        </div>
                                        <span className='text-sm text-gray-700 flex-1 group-hover:text-gray-900 transition-colors leading-relaxed'>
                                            {feature.text}
                                        </span>
                                        <CheckCircle className='h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity' />
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className='flex flex-col gap-3'>
                                <Button
                                    onClick={handleInterestClick}
                                    disabled={isLoading || isInterested}
                                    className={`w-full font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group ${
                                        isInterested
                                            ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-200"
                                    }`}>
                                    {isLoading ? (
                                        <div className='flex items-center gap-2'>
                                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                            Registering...
                                        </div>
                                    ) : isInterested ? (
                                        <div className='flex items-center gap-2 animate-in zoom-in duration-300'>
                                            <CheckCircle className='h-4 w-4 animate-bounce' />
                                            Interest Registered ✓
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-2'>
                                            <Sparkles className='h-4 w-4 group-hover:animate-spin' />
                                            Interested? Count Me In! 🚀
                                            <ArrowRight className='h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1' />
                                        </div>
                                    )}
                                </Button>

                                <Button
                                    variant='ghost'
                                    onClick={handleDismiss}
                                    className='w-full text-gray-600 hover:text-gray-800 text-sm hover:bg-gray-100 transition-all duration-200'>
                                    Maybe Later
                                </Button>
                            </div>

                            <p className='text-xs text-gray-500 text-center mt-4'>
                                Be the first to know when we launch • No spam,
                                ever
                            </p>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default SubscriptionInterestPopover
