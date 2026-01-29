import { Copy, RotateCcw, Sparkles } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { UseResumeBuilderReturn } from "@/types/builder"

interface ResultScreenProps {
    builder: UseResumeBuilderReturn
}

export default function ResultScreen({ builder }: ResultScreenProps) {
    const router = useRouter()
    const {
        calculateOverallScore,
        resetBuilder,
        setShowConfetti,
        showConfetti
    } = builder

    useEffect(() => {
        setShowConfetti(true)
        const timer = setTimeout(() => setShowConfetti(false), 3000)
        return () => clearTimeout(timer)
    }, [setShowConfetti])

    useEffect(() => {
        // Ensure scroll is unlocked when leaving the result screen
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [])

    const handleShareResult = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url)
        toast.success("Link Copied!", {
            description:
                "Resume builder link copied to clipboard. Share it with your friends!"
        })
    }

    const handleStartFresh = () => {
        resetBuilder()
        toast.success("Reset Complete!", {
            description:
                "All progress has been reset. Start building your perfect resume again!"
        })
    }

    return (
        <div className='min-h-screen bg-white pt-20'>
            {/* Confetti Effect */}
            {showConfetti && (
                <div className='fixed inset-0 pointer-events-none z-50'>
                    <div className='absolute inset-0 overflow-hidden'>
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className='absolute animate-bounce'
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`
                                }}>
                                <Sparkles className='w-4 h-4 text-yellow-400' />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className='container mx-auto px-6 py-16'>
                <div className='max-w-4xl mx-auto text-center space-y-8 animate-fade-in'>
                    <Card className='bg-primary text-white border-0 transition-all duration-500'>
                        <CardContent className='p-12'>
                            <div className='space-y-6'>
                                <Sparkles className='w-16 h-16 mx-auto text-yellow-400 animate-pulse' />
                                <h2 className='text-4xl font-bold'>
                                    Congratulations! 🎉
                                </h2>
                                <div className='text-7xl font-bold animate-pulse'>
                                    {calculateOverallScore()}%
                                </div>
                                <p className='text-xl mb-6'>
                                    You've built a world-class resume that recruiters will love!
                                </p>
                                <div className='space-y-2 text-left max-w-md mx-auto'>
                                    <p className='text-sm'>
                                        • Your resume now follows industry best practices
                                    </p>
                                    <p className='text-sm'>
                                        • You've included recruiter-approved content
                                    </p>
                                    <p className='text-sm'>
                                        • You're ready to apply for top companies
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className='flex flex-wrap justify-center gap-4'>
                        <Button
                            onClick={handleShareResult}
                            className='bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2 transition-all duration-300'>
                            <Copy className='w-4 h-4' />
                            Share with Friends
                        </Button>
                        <Button
                            onClick={handleStartFresh}
                            variant='outline'
                            className='border-primary text-primary hover:bg-primary hover:text-white flex items-center gap-2 transition-all duration-300'>
                            <RotateCcw className='w-4 h-4' />
                            Start Fresh
                        </Button>
                        <Button
                            onClick={() => router.push("/")}
                            variant='outline'
                            className='border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-300'>
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
