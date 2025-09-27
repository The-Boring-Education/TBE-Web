import {
    Share2,
    Copy,
    Twitter,
    Linkedin,
    Facebook,
    Trophy,
    Target,
    Calendar
} from "lucide-react"
import React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Challenge } from "@/types/challenges"
import {
    generateSocialMessage,
    SocialMediaTemplateData
} from "@/utils/socialMediaTemplates"

interface ChallengeShareCardProps {
    challenge: Challenge
    className?: string
    variant?: "completion" | "milestone" | "progress"
}

const ChallengeShareCard = ({
    challenge,
    className = "",
    variant = "progress"
}: ChallengeShareCardProps) => {
    const progressPercentage = Math.round(
        (challenge.currentDay / challenge.totalDays) * 100
    )
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL

    const getShareMessage = (templateId: string = "default") => {
        const templateData: SocialMediaTemplateData = {
            challengeName: challenge.name,
            currentDay: challenge.currentDay,
            totalDays: challenge.totalDays,
            progressText: getContextualProgress(),
            hoursSpent: 0, // This would be tracked per log
            nextGoals: getContextualGoals(),
            appUrl
        }

        return generateSocialMessage(templateId, templateData)
    }

    const getContextualProgress = () => {
        switch (variant) {
            case "completion":
                return `🎉 Successfully completed my ${challenge.name} challenge! What an incredible journey of growth and learning.`
            case "milestone":
                if (progressPercentage >= 75) {
                    return `💪 ${progressPercentage}% through my ${challenge.name} challenge! The finish line is in sight and I'm feeling stronger than ever.`
                } else if (progressPercentage >= 50) {
                    return `🚀 Reached the halfway mark in my ${challenge.name} challenge! The momentum is building and I'm loving the progress.`
                } else {
                    return `⚡ Making steady progress on my ${challenge.name} challenge! Every day brings new insights and skills.`
                }
            default:
                return `📈 Day ${challenge.currentDay + 1} of ${challenge.totalDays} in my ${challenge.name} challenge. Staying consistent and pushing forward!`
        }
    }

    const getContextualGoals = () => {
        switch (variant) {
            case "completion":
                return [
                    "Start my next learning challenge",
                    "Apply new skills to real projects",
                    "Share knowledge with others"
                ]
            case "milestone":
                return [
                    "Maintain daily consistency",
                    "Deepen understanding of core concepts",
                    "Prepare for upcoming advanced topics"
                ]
            default:
                return [
                    "Continue daily progress",
                    "Focus on practical application",
                    "Build upon yesterday's learning"
                ]
        }
    }

    const getVariantIcon = () => {
        switch (variant) {
            case "completion":
                return <Trophy className='w-5 h-5 text-yellow-500' />
            case "milestone":
                return <Target className='w-5 h-5 text-green-500' />
            default:
                return <Calendar className='w-5 h-5 text-blue-500' />
        }
    }

    const getVariantTitle = () => {
        switch (variant) {
            case "completion":
                return "Challenge Completed! 🎉"
            case "milestone":
                return `${progressPercentage}% Milestone Reached! 🎯`
            default:
                return "Share Your Progress 📈"
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success("Copied to clipboard! 📋")
        } catch (error) {
            toast.error("Failed to copy to clipboard")
        }
    }

    const shareToSocial = (
        platform: string,
        templateId: string = "default"
    ) => {
        const appUrl = process.env.NEXT_PUBLIC_BASE_URL
        const message = generateSocialMessage(templateId, {
            challengeName: challenge.name,
            currentDay: challenge.currentDay,
            totalDays: challenge.totalDays,
            progressText: getContextualProgress(),
            hoursSpent: 0, // This would be tracked per log
            nextGoals: getContextualGoals(),
            appUrl
        })
        const encodedText = encodeURIComponent(message)

        let shareUrl = ""
        switch (platform) {
            case "twitter":
                // Updated to use X (Twitter) sharing URL
                shareUrl = `https://x.com/intent/tweet?text=${encodedText}`
                break
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    appUrl
                )}&summary=${encodedText}`
                break
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    appUrl
                )}&quote=${encodedText}`
                break
        }

        if (shareUrl) {
            window.open(shareUrl, "_blank", "width=600,height=400")
            toast.success(
                `Opening ${
                    platform === "twitter" ? "X (Twitter)" : platform
                }... 🚀`
            )
        }
    }

    return (
        <Card
            className={`bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20 ${className}`}>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                    {getVariantIcon()}
                    {getVariantTitle()}
                </CardTitle>
                <CardDescription>
                    Share your learning journey and inspire others to start
                    their own challenges
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {/* Challenge Info */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='font-semibold text-white'>
                            {challenge.name}
                        </h3>
                        <p className='text-sm text-gray-400'>
                            Day {challenge.currentDay + 1} of{" "}
                            {challenge.totalDays} • {progressPercentage}%
                            complete
                        </p>
                    </div>
                    <Badge
                        variant='outline'
                        className='bg-primary/20 text-primary border-primary/30'>
                        {challenge.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>

                {/* Quick Share Options */}
                <div className='grid grid-cols-2 gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            copyToClipboard(getShareMessage("default"))
                        }
                        className='border-gray-600 text-white hover:bg-gray-700'>
                        <Copy className='w-4 h-4 mr-2' />
                        Copy Message
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            copyToClipboard(getShareMessage("motivational"))
                        }
                        className='border-gray-600 text-white hover:bg-gray-700'>
                        <Share2 className='w-4 h-4 mr-2' />
                        Motivational
                    </Button>
                </div>

                {/* Social Platform Buttons */}
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            shareToSocial("twitter", "twitter-short")
                        }
                        className='flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10'>
                        <Twitter className='w-4 h-4 mr-1' />
                        Twitter
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            shareToSocial("linkedin", "linkedin-professional")
                        }
                        className='flex-1 border-blue-600/50 text-blue-500 hover:bg-blue-600/10'>
                        <Linkedin className='w-4 h-4 mr-1' />
                        LinkedIn
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            shareToSocial("facebook", "storytelling")
                        }
                        className='flex-1 border-blue-700/50 text-blue-600 hover:bg-blue-700/10'>
                        <Facebook className='w-4 h-4 mr-1' />
                        Facebook
                    </Button>
                </div>

                {/* Preview Message */}
                <div className='bg-gray-900/50 p-3 rounded-lg border border-gray-600'>
                    <p className='text-xs text-gray-400 mb-2'>Preview:</p>
                    <p className='text-sm text-gray-300 line-clamp-3'>
                        {getShareMessage("default").substring(0, 120)}...
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default ChallengeShareCard
