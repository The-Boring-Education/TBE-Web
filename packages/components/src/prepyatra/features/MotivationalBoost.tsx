import {
    Flame,
    TrendingUp,
    Trophy,
    Target,
    Sparkles,
    Share2
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import type { Challenge } from "@tbe/types"

interface MotivationalBoostProps {
    challenges: Challenge[]
    className?: string
}

interface MotivationalQuote {
    text: string
    author: string
    type: "progress" | "consistency" | "milestone" | "completion" | "start"
}

const motivationalQuotes: MotivationalQuote[] = [
    {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes",
        type: "start"
    },
    {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier",
        type: "consistency"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        type: "progress"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        type: "start"
    },
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela",
        type: "milestone"
    },
    {
        text: "Champions are made from something deep inside them - a desire, a dream, a vision.",
        author: "Muhammad Ali",
        type: "completion"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        type: "progress"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        type: "consistency"
    }
]

const MotivationalBoost = ({
    challenges,
    className = ""
}: MotivationalBoostProps) => {
    const activeChallenges = challenges.filter((c) => c.isActive)
    const completedChallenges = challenges.filter(
        (c) => !c.isActive && c.currentDay >= c.totalDays
    )

    // Calculate overall progress
    const totalProgress = challenges.reduce((sum, challenge) => {
        return sum + (challenge.currentDay / challenge.totalDays) * 100
    }, 0)

    const averageProgress =
        challenges.length > 0 ? totalProgress / challenges.length : 0

    // Determine motivational context
    const getMotivationalContext = (): MotivationalQuote["type"] => {
        if (challenges.length === 0) {
            return "start"
        }
        if (completedChallenges.length > 0) {
            return "completion"
        }
        if (averageProgress >= 75) {
            return "milestone"
        }
        if (averageProgress >= 25) {
            return "progress"
        }
        return "consistency"
    }

    const context = getMotivationalContext()
    const relevantQuotes = motivationalQuotes.filter((q) => q.type === context)
    const randomQuote =
        relevantQuotes[Math.floor(Math.random() * relevantQuotes.length)]

    // Get streak information
    const getCurrentStreak = () => {
        // This is a simplified calculation - in a real app, you'd track actual logging streaks
        const activeChallenge = activeChallenges[0]
        if (!activeChallenge) {
            return 0
        }
        return activeChallenge.currentDay
    }

    const currentStreak = getCurrentStreak()

    // Generate achievement badge
    const getAchievementBadge = () => {
        if (completedChallenges.length >= 3) {
            return {
                text: "Master Learner",
                icon: "🏆",
                color: "bg-yellow-500"
            }
        }
        if (completedChallenges.length >= 1) {
            return {
                text: "Challenge Completed",
                icon: "🎯",
                color: "bg-green-500"
            }
        }
        if (currentStreak >= 21) {
            return { text: "21-Day Warrior", icon: "🔥", color: "bg-red-500" }
        }
        if (currentStreak >= 7) {
            return { text: "Week Streak", icon: "⚡", color: "bg-blue-500" }
        }
        if (currentStreak >= 3) {
            return {
                text: "Building Momentum",
                icon: "🚀",
                color: "bg-purple-500"
            }
        }
        return { text: "Getting Started", icon: "✨", color: "bg-gray-500" }
    }

    const achievement = getAchievementBadge()

    const shareAchievement = async () => {
        const achievementText = `🎉 Just earned the "${
            achievement.text
        }" badge on my learning journey!
    
📊 My Stats:
• ${activeChallenges.length} active challenges
• ${completedChallenges.length} completed challenges  
• ${currentStreak} day current streak
• ${Math.round(averageProgress)}% average progress

"${randomQuote?.text}" - ${randomQuote?.author}

Join me on Prep Yatra and start your own challenge! 🚀
${process.env.NEXT_PUBLIC_BASE_URL}

#PrepYatra #LearningJourney #ChallengeAccepted #ConsistencyIsKey`

        try {
            await navigator.clipboard.writeText(achievementText)
            toast.success("Achievement message copied to clipboard! 📋")
        } catch (error) {
            toast.error("Failed to copy to clipboard")
        }
    }

    if (challenges.length === 0) {
        return (
            <Card
                className={`bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20 ${className}`}>
                <CardContent className='pt-6'>
                    <div className='text-center space-y-4'>
                        <div className='w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto'>
                            <Sparkles className='w-8 h-8 text-white' />
                        </div>
                        <div>
                            <h3 className='text-lg font-semibold text-white mb-2'>
                                Ready to Start Your Journey?
                            </h3>
                            <p className='text-gray-300 text-sm mb-4'>
                                "{randomQuote?.text}"
                            </p>
                            <p className='text-gray-400 text-xs'>
                                - {randomQuote?.author}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className={`bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20 ${className}`}>
            <CardContent className='pt-6'>
                <div className='space-y-4'>
                    {/* Achievement Badge */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div
                                className={`w-12 h-12 ${achievement.color} rounded-full flex items-center justify-center text-white text-xl`}>
                                {achievement.icon}
                            </div>
                            <div>
                                <h3 className='font-semibold text-white'>
                                    {achievement.text}
                                </h3>
                                <p className='text-sm text-gray-400'>
                                    Keep up the amazing work!
                                </p>
                            </div>
                        </div>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={shareAchievement}
                            className='border-primary/30 text-primary hover:bg-primary/10'>
                            <Share2 className='w-4 h-4 mr-1' />
                            Share
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='text-center'>
                            <div className='flex items-center justify-center gap-1 text-green-400 mb-1'>
                                <Trophy className='w-4 h-4' />
                                <span className='text-lg font-bold'>
                                    {completedChallenges.length}
                                </span>
                            </div>
                            <p className='text-xs text-gray-400'>Completed</p>
                        </div>
                        <div className='text-center'>
                            <div className='flex items-center justify-center gap-1 text-blue-400 mb-1'>
                                <Target className='w-4 h-4' />
                                <span className='text-lg font-bold'>
                                    {activeChallenges.length}
                                </span>
                            </div>
                            <p className='text-xs text-gray-400'>Active</p>
                        </div>
                        <div className='text-center'>
                            <div className='flex items-center justify-center gap-1 text-orange-400 mb-1'>
                                <Flame className='w-4 h-4' />
                                <span className='text-lg font-bold'>
                                    {currentStreak}
                                </span>
                            </div>
                            <p className='text-xs text-gray-400'>Day Streak</p>
                        </div>
                        <div className='text-center'>
                            <div className='flex items-center justify-center gap-1 text-purple-400 mb-1'>
                                <TrendingUp className='w-4 h-4' />
                                <span className='text-lg font-bold'>
                                    {Math.round(averageProgress)}%
                                </span>
                            </div>
                            <p className='text-xs text-gray-400'>
                                Avg Progress
                            </p>
                        </div>
                    </div>

                    {/* Motivational Quote */}
                    <div className='border-t border-primary/20 pt-4'>
                        <blockquote className='text-sm text-gray-300 italic text-center'>
                            "{randomQuote?.text}"
                        </blockquote>
                        <p className='text-xs text-gray-400 text-center mt-2'>
                            - {randomQuote?.author}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default MotivationalBoost
