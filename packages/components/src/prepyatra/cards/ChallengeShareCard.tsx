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

import { Badge } from "../ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card"
import Button from "../../common/Buttons/Button"
import { Challenge } from "@tbe/types"
import {
    generateSocialMessage,
SocialMediaTemplateData
    } from "@tbe/utils"

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
            appUrl:appUrl || ""
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
            appUrl:appUrl || ""
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
                    appUrl || ""
                )}&summary=${encodedText}`
                break
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    appUrl || ""
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
            className={`glass border-greyLight ${className}`}>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-contentLight'>
                    {getVariantIcon()}
                    {getVariantTitle()}
                </CardTitle>
                <CardDescription className='text-greyDark'>
                    Share your learning journey and inspire others to start
                    their own challenges
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {/* Challenge Info */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='font-semibold text-contentLight'>
                            {challenge.name}
                        </h3>
                        <p className='text-sm text-greyDark'>
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
                        variant='NEUTRAL'
                        text='Copy Message'
                        onClick={() =>
                            copyToClipboard(getShareMessage("default"))
                        }
                        icon={<Copy className='w-4 h-4' />}
                        className='text-sm px-3 py-1.5'
                    />
                    <Button
                        variant='NEUTRAL'
                        text='Motivational'
                        onClick={() =>
                            copyToClipboard(getShareMessage("motivational"))
                        }
                        icon={<Share2 className='w-4 h-4' />}
                        className='text-sm px-3 py-1.5'
                    />
                </div>

                {/* Social Platform Buttons */}
                <div className='flex gap-2'>
                    <Button
                        variant='OUTLINE'
                        text='Twitter'
                        onClick={() =>
                            shareToSocial("twitter", "twitter-short")
                        }
                        icon={<Twitter className='w-4 h-4' />}
                        className='flex-1 text-sm px-3 py-1.5 border-blue-500 text-blue-600 hover:border-blue-600'
                    />
                    <Button
                        variant='OUTLINE'
                        text='LinkedIn'
                        onClick={() =>
                            shareToSocial("linkedin", "linkedin-professional")
                        }
                        icon={<Linkedin className='w-4 h-4' />}
                        className='flex-1 text-sm px-3 py-1.5 border-blue-600 text-blue-700 hover:border-blue-700'
                    />
                    <Button
                        variant='OUTLINE'
                        text='Facebook'
                        onClick={() =>
                            shareToSocial("facebook", "storytelling")
                        }
                        icon={<Facebook className='w-4 h-4' />}
                        className='flex-1 text-sm px-3 py-1.5 border-blue-700 text-blue-800 hover:border-blue-800'
                    />
                </div>

                {/* Preview Message */}
                <div className='bg-white/50 p-3 rounded-lg border border-greyLight'>
                    <p className='text-xs text-greyDark mb-2'>Preview:</p>
                    <p className='text-sm text-contentLight line-clamp-3'>
                        {getShareMessage("default").substring(0, 120)}...
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default ChallengeShareCard
