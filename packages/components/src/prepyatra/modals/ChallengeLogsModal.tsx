import {
    Calendar,
    Clock,
    Share2,
    Copy,
    TrendingUp,
    Target,
    CheckCircle2,
    ExternalLink,
    Trophy
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { Badge } from "../ui/badge"
    import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { Label } from "../ui/label"
import { challengesService } from "@tbe/services"
import type { Challenge, ChallengeLog } from "@tbe/types"

interface ChallengeLogsModalProps {
    isOpen: boolean
    onClose: () => void
    challenge: Challenge
}

const ChallengeLogsModal = ({
    isOpen,
    onClose,
    challenge
}: ChallengeLogsModalProps) => {
    const [logs, setLogs] = useState<ChallengeLog[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedLog, setSelectedLog] = useState<ChallengeLog | null>(null)
    const [showSocialPreview, setShowSocialPreview] = useState(false)
    const [socialMessage, setSocialMessage] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState<number>(0)

    useEffect(() => {
        if (isOpen && challenge._id) {
            fetchLogs()
        }
    }, [isOpen, challenge._id])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const challengeLogs = await challengesService.getLogs(challenge._id)
            setLogs(challengeLogs.sort((a, b) => b.day - a.day)) // Sort by day descending
        } catch (error) {
            console.error("Error fetching challenge logs:", error)
            toast.error("Failed to fetch challenge logs")
        } finally {
            setLoading(false)
        }
    }

    const generateSocialMessage = (
        log: ChallengeLog,
        templateIndex: number = 0
    ) => {
        const progressPercentage = Math.round(
            (log.day / challenge.totalDays) * 100
        )
        const appUrl = process.env.NEXT_PUBLIC_BASE_URL

        const templates = [
            // Template 1: Casual and friendly
            `Just wrapped up Day ${log.day} of my ${challenge.name}! 🎉

Today was pretty productive - ${log.progressText}

Spent ${
                log.hoursSpent
            } hours grinding, and honestly feeling good about the progress! 

For tomorrow, I'm planning to:
${log.nextGoals.map((goal, index) => `${index + 1}. ${goal}`).join("\n")}

${
    progressPercentage >= 90
        ? "Almost there! 🏁"
        : progressPercentage >= 75
          ? "Getting close! 🔥"
          : progressPercentage >= 50
            ? "Halfway point! ⚡"
            : progressPercentage >= 25
              ? "Building momentum! 🚀"
              : "Just getting started! ✨"
}

${
    challenge.category ? `#${challenge.category} ` : ""
}#LearningJourney #PrepYatra

Check out Prep Yatra if you want to start your own challenge! ${appUrl}`,

            // Template 2: Professional and focused
            `📚 Learning Update: Day ${log.day}/${challenge.totalDays} - ${
                challenge.name
            }

✅ Today's Accomplishments:
${log.progressText}

⏱️ Time Investment: ${log.hoursSpent} hours
📊 Progress: ${progressPercentage}% complete

🎯 Next Session Goals:
${log.nextGoals.map((goal, index) => `• ${goal}`).join("\n")}

${
    progressPercentage >= 90
        ? "Final stretch - staying focused on the goal! 🎯"
        : progressPercentage >= 75
          ? "Strong progress - maintaining consistency! 💪"
          : progressPercentage >= 50
            ? "Milestone reached - building solid foundation! 🏗️"
            : progressPercentage >= 25
              ? "Establishing learning rhythm - every day counts! 📈"
              : "Setting the foundation - committed to the process! 🌱"
}

${
    challenge.category ? `#${challenge.category} ` : ""
}#ProfessionalDevelopment #ContinuousLearning #PrepYatra`,

            // Template 3: Motivational and inspiring
            `🚀 Day ${log.day} of my ${challenge.name} journey!

Today I learned: ${log.progressText}

${log.hoursSpent} hours of focused learning later, and I'm feeling inspired! 

My vision for tomorrow:
${log.nextGoals.map((goal, index) => `✨ ${goal}`).join("\n")}

${
    progressPercentage >= 90
        ? "The finish line is calling! 🏁"
        : progressPercentage >= 75
          ? "The momentum is real! 🔥"
          : progressPercentage >= 50
            ? "Halfway there - proving it's possible! ⚡"
            : progressPercentage >= 25
              ? "Every step forward is progress! 🚀"
              : "Just getting started! ✨"
}

Remember: Consistency beats perfection every time! 

${
    challenge.category ? `#${challenge.category} ` : ""
}#Motivation #GrowthMindset #PrepYatra #LearningJourney`
        ]

        return templates[templateIndex] || templates[0]
    }

    const handleShareLog = (log: ChallengeLog) => {
        setSelectedLog(log)
        const message = generateSocialMessage(log, selectedTemplate)
        setSocialMessage(message || "")
        setShowSocialPreview(true)
    }

    const handleTemplateChange = (templateIndex: number) => {
        setSelectedTemplate(templateIndex)
        if (selectedLog) {
            const message = generateSocialMessage(selectedLog, templateIndex)
            setSocialMessage(message || "")
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

    const shareToSocial = (platform: string) => {
        // Use the local generateSocialMessage function with the selected log and template
        const message = selectedLog
            ? generateSocialMessage(selectedLog, selectedTemplate)
            : ""
        const encodedText = encodeURIComponent(message || "")
        const appUrl = process.env.NEXT_PUBLIC_BASE_URL

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    const calculateOverallProgress = () => {
        if (logs.length === 0) {
            return 0
        }
        const totalDays = logs.length
        return Math.round((totalDays / challenge.totalDays) * 100)
    }

    const totalHoursSpent = logs.reduce((sum, log) => sum + log.hoursSpent, 0)
    const averageHoursPerDay =
        logs.length > 0 ? (totalHoursSpent / logs.length).toFixed(1) : 0

    // Check if challenge is completed
    const isCompleted = challenge.currentDay >= challenge.totalDays

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto glass border-greyLight'>
                {!showSocialPreview ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-xl font-bold text-contentLight flex items-center gap-2'>
                                <Target className='w-5 h-5 text-primary' />
                                Challenge Progress Logs
                            </DialogTitle>
                            <DialogDescription className='text-greyDark'>
                                View all progress logs for "{challenge.name}"
                            </DialogDescription>
                        </DialogHeader>

                        {/* Challenge Summary */}
                        <Card className='bg-white/30 border-greyLight'>
                            <CardHeader className='pb-3'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <CardTitle className='text-lg text-contentLight'>
                                            {challenge.name}
                                        </CardTitle>
                                            <div className='flex items-center gap-4 mt-2 text-sm text-greyDark'>
                                            <div className='flex items-center gap-1'>
                                                <Calendar className='w-3 h-3' />
                                                {challenge.currentDay +
                                                    1} of {challenge.totalDays}{" "}
                                                days
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <TrendingUp className='w-3 h-3' />
                                                {calculateOverallProgress()}%
                                                Overall Progress
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <Clock className='w-3 h-3' />
                                                {totalHoursSpent}h total • ~
                                                {averageHoursPerDay}h/day
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Badge className='bg-primary/20 text-primary border-primary/30'>
                                            {challenge.isActive
                                                ? "Active"
                                                : "Completed"}
                                        </Badge>
                                        {isCompleted && (
                                            <Badge className='bg-yellow-500/20 text-yellow-300 border-yellow-500/30'>
                                                <Trophy className='w-3 h-3 mr-1' />
                                                Completed
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Logs List */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-lg font-semibold text-contentLight'>
                                    Progress Logs ({logs.length})
                                </h3>
                                {logs.length > 0 && (
                                    <Button
                                        onClick={() => handleShareLog(logs[0] || {} as ChallengeLog)}
                                        variant='outline'
                                        size='sm'
                                        className='border-primary/30 text-primary hover:bg-primary/10'>
                                        <Share2 className='w-4 h-4 mr-2' />
                                        Share Latest Progress
                                    </Button>
                                )}
                            </div>

                            {loading ? (
                                <div className='text-center py-8'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
                                    <p className='text-greyDark mt-2'>
                                        Loading logs...
                                    </p>
                                </div>
                            ) : logs.length === 0 ? (
                                <Card className='bg-white/30 border-greyLight'>
                                    <CardContent className='pt-6 text-center'>
                                        <Target className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                                        <p className='text-contentLight mb-2'>
                                            No progress logs yet
                                        </p>
                                        <p className='text-greyDark text-sm'>
                                            Start logging your daily progress to
                                            see your journey here!
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className='space-y-3'>
                                    {logs.map((log) => (
                                        <Card
                                            key={log._id}
                                            className='bg-white/30 border-greyLight'>
                                            <CardHeader className='pb-3'>
                                                <div className='flex items-center justify-between'>
                                                    <div className='flex items-center gap-3'>
                                                        <Badge className='bg-primary/20 text-primary border-primary/30'>
                                                            Day {log.day}
                                                        </Badge>
                                                        <div className='text-sm text-greyDark'>
                                                            {formatDate(
                                                                log.loggedAt
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <Badge
                                                            variant='outline'
                                                            className='border-greyLight text-greyDark'>
                                                            <Clock className='w-3 h-3 mr-1' />
                                                            {log.hoursSpent}h
                                                        </Badge>
                                                        <Button
                                                            onClick={() =>
                                                                handleShareLog(
                                                                    log
                                                                )
                                                            }
                                                            variant='outline'
                                                            size='sm'
                                                            className='border-primary/30 text-primary hover:bg-primary/10'>
                                                            <Share2 className='w-4 h-4' />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className='space-y-3'>
                                                <div>
                                                    <h4 className='text-contentLight font-medium mb-2'>
                                                        What I worked on:
                                                    </h4>
                                                    <p className='text-greyDark text-sm'>
                                                        {log.progressText}
                                                    </p>
                                                </div>

                                                {log.nextGoals.length > 0 && (
                                                    <div>
                                                        <h4 className='text-contentLight font-medium mb-2'>
                                                            Next goals:
                                                        </h4>
                                                        <ul className='space-y-1'>
                                                            {log.nextGoals.map(
                                                                (
                                                                    goal,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                        className='text-greyDark text-sm flex items-center gap-2'>
                                                                        <span className='text-primary'>
                                                                            •
                                                                        </span>
                                                                        {goal}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={onClose}
                                variant='outline'
                                className='border-greyLight text-contentLight hover:bg-greyLight'>
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-xl font-bold text-contentLight flex items-center gap-2'>
                                <Share2 className='w-5 h-5 text-primary' />
                                Share Your Progress
                            </DialogTitle>
                            <DialogDescription className='text-greyDark'>
                                Share Day {selectedLog?.day} progress on social
                                media
                            </DialogDescription>
                        </DialogHeader>

                        <Card className='bg-white/30 border-greyLight'>
                            <CardHeader>
                                <CardTitle className='text-lg text-white flex items-center gap-2'>
                                    <ExternalLink className='w-5 h-5 text-primary' />
                                    Social Media Post
                                </CardTitle>
                                <DialogDescription>
                                    Your progress has been formatted for sharing
                                </DialogDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Template Selection */}
                                <div className='space-y-3 mb-4'>
                                    <Label className='text-white font-medium'>
                                        Choose your style:
                                    </Label>
                                    <div className='grid grid-cols-1 gap-3'>
                                        {[
                                            {
                                                name: "Casual & Friendly",
                                                icon: "😊",
                                                desc: "Perfect for social media"
                                            },
                                            {
                                                name: "Professional & Focused",
                                                icon: "💼",
                                                desc: "Great for LinkedIn"
                                            },
                                            {
                                                name: "Motivational & Inspiring",
                                                icon: "🚀",
                                                desc: "Encourage others"
                                            }
                                        ].map((template, index) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    selectedTemplate === index
                                                        ? "border-primary bg-primary/10"
                                                        : "border-gray-600 bg-gray-800/30 hover:border-gray-500"
                                                }`}
                                                onClick={() =>
                                                    handleTemplateChange(index)
                                                }>
                                                <div className='flex items-center gap-3'>
                                                    <span className='text-2xl'>
                                                        {template.icon}
                                                    </span>
                                                    <div className='flex-1'>
                                                        <div className='text-white font-medium'>
                                                            {template.name}
                                                        </div>
                                                        <div className='text-gray-400 text-sm'>
                                                            {template.desc}
                                                        </div>
                                                    </div>
                                                    {selectedTemplate ===
                                                        index && (
                                                        <CheckCircle2 className='w-5 h-5 text-primary' />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='space-y-3 mb-4'>
                                    <label className='text-white font-medium block'>
                                        Your message:
                                    </label>
                                    <div className='bg-gray-900/50 p-4 rounded-lg border border-gray-600 max-h-64 overflow-y-auto'>
                                        <pre className='text-sm text-gray-200 whitespace-pre-wrap font-sans'>
                                            {socialMessage}
                                        </pre>
                                    </div>
                                </div>

                                <div className='space-y-3'>
                                    {/* Copy and Share Buttons */}
                                    <div className='flex flex-wrap gap-2'>
                                        <Button
                                            onClick={() =>
                                                copyToClipboard(socialMessage || "")
                                            }
                                            variant='outline'
                                            size='sm'
                                            className='border-gray-600 text-white hover:bg-gray-700'>
                                            <Copy className='w-4 h-4 mr-2' />
                                            Copy Text
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                copyToClipboard(socialMessage)
                                                toast.success(
                                                    "Ready to share! 📱"
                                                )
                                            }}
                                            variant='outline'
                                            size='sm'
                                            className='border-primary/30 text-primary hover:bg-primary/10'>
                                            <Share2 className='w-4 h-4 mr-2' />
                                            Copy & Share
                                        </Button>
                                    </div>

                                    {/* Direct Social Media Posting */}
                                    <div className='space-y-2'>
                                        <Label className='text-white font-medium'>
                                            Post directly to:
                                        </Label>
                                        <div className='flex flex-wrap gap-2'>
                                            <Button
                                                onClick={() =>
                                                    shareToSocial("twitter")
                                                }
                                                variant='outline'
                                                size='sm'
                                                className='border-blue-500/50 text-blue-400 hover:bg-blue-500/10'>
                                                <svg
                                                    className='w-4 h-4 mr-2'
                                                    viewBox='0 0 24 24'
                                                    fill='currentColor'>
                                                    <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                                                </svg>
                                                Twitter
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    shareToSocial("linkedin")
                                                }
                                                variant='outline'
                                                size='sm'
                                                className='border-blue-600/50 text-blue-500 hover:bg-blue-600/10'>
                                                <svg
                                                    className='w-4 h-4 mr-2'
                                                    viewBox='0 0 24 24'
                                                    fill='currentColor'>
                                                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                                                </svg>
                                                LinkedIn
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    shareToSocial("facebook")
                                                }
                                                variant='outline'
                                                size='sm'
                                                className='border-blue-700/50 text-blue-600 hover:bg-blue-700/10'>
                                                <svg
                                                    className='w-4 h-4 mr-2'
                                                    viewBox='0 0 24 24'
                                                    fill='currentColor'>
                                                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                                                </svg>
                                                Facebook
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <DialogFooter>
                            <Button
                                onClick={() => setShowSocialPreview(false)}
                                variant='outline'
                                className='border-greyLight text-contentLight hover:bg-greyLight'>
                                Back to Logs
                            </Button>
                            <Button
                                onClick={onClose}
                                className='bg-primary text-white hover:bg-primary/90'>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ChallengeLogsModal
