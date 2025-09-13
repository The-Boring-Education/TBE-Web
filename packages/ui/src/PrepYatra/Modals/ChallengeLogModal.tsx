import { Share2, Copy, TrendingUp, CheckCircle2, Trophy } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { challengesService } from "@/services/challenges"
import { prepLogsService } from "@/services/prep-logs"
import { Challenge } from "@/types/challenges"

interface ChallengeLogModalProps {
    isOpen: boolean
    onClose: () => void
    onProgressLogged: () => void
    challenge: Challenge
    userId: string
}

const ChallengeLogModal = ({
    isOpen,
    onClose,
    onProgressLogged,
    challenge,
    userId
}: ChallengeLogModalProps) => {
    const [formData, setFormData] = useState({
        progressText: "",
        hoursSpent: "",
        nextGoals: ["", "", ""]
    })
    const [loading, setLoading] = useState(false)
    const [copyToPrepLogs, setCopyToPrepLogs] = useState(true)
    const [showSocialPreview, setShowSocialPreview] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<number>(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Check if challenge is completed
    const isChallengeCompleted = challenge.currentDay >= challenge.totalDays
    const nextDay = challenge.currentDay


    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleNextGoalChange = (index: number, value: string) => {
        const newGoals = [...formData.nextGoals]
        newGoals[index] = value
        setFormData((prev) => ({
            ...prev,
            nextGoals: newGoals
        }))
    }

    const generateSocialMessageFromTemplate = (templateIndex: number) => {
        const progressPercentage = Math.round(
            (nextDay / challenge.totalDays) * 100
        )
        const appUrl = process.env.NEXT_PUBLIC_BASE_URL

        const templates = [
            // Template 1: Casual and friendly
            `Just wrapped up Day ${nextDay + 1} of my ${challenge.name}! 🎉

Today was pretty productive - ${formData.progressText}

Spent ${
                formData.hoursSpent
            } hours grinding, and honestly feeling good about the progress! 

For tomorrow, I'm planning to:
${formData.nextGoals
    .filter((goal) => goal.trim())
    .map((goal, index) => `${index + 1}. ${goal}`)
    .join("\n")}

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
            `📚 Learning Update: Day ${nextDay + 1}/${challenge.totalDays} - ${
                challenge.name
            }

✅ Today's Accomplishments:
${formData.progressText}

⏱️ Time Investment: ${formData.hoursSpent} hours
📊 Progress: ${progressPercentage}% complete

🎯 Next Session Goals:
${formData.nextGoals
    .filter((goal) => goal.trim())
    .map((goal, index) => `• ${goal}`)
    .join("\n")}

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
            `🚀 Day ${nextDay + 1} of my ${challenge.name} journey!

Today I learned: ${formData.progressText}

${
    formData.hoursSpent
} hours of focused learning later, and I'm feeling inspired! 

My vision for tomorrow:
${formData.nextGoals
    .filter((goal) => goal.trim())
    .map((goal, index) => `✨ ${goal}`)
    .join("\n")}

${
    progressPercentage >= 90
        ? "The finish line is calling! 🏁"
        : progressPercentage >= 75
        ? "The momentum is real! 🔥"
        : progressPercentage >= 50
        ? "Halfway there - proving it's possible! ⚡"
        : progressPercentage >= 25
        ? "Every step forward is progress! 🚀"
        : "The journey of a thousand miles begins with a single step! ✨"
}

Remember: Consistency beats perfection every time! 

${
    challenge.category ? `#${challenge.category} ` : ""
}#Motivation #GrowthMindset #PrepYatra #LearningJourney`
        ]

        return templates[templateIndex] || templates[0]
    }

    const handleSubmit = async () => {
        if (!formData.progressText.trim()) {
            toast.error("Please describe what you accomplished today")
            return
        }

        if (!formData.hoursSpent || parseFloat(formData.hoursSpent) <= 0) {
            toast.error("Please enter valid hours spent")
            return
        }

        if (isChallengeCompleted) {
            toast.error("This challenge is already completed!")
            return
        }

        setLoading(true)
        try {
            const hours = parseFloat(formData.hoursSpent)

            const logData = {
                challengeId: challenge._id,
                day: nextDay + 1, // API expects 1-indexed days
                progressText: formData.progressText,
                hoursSpent: hours,
                nextGoals: formData.nextGoals.filter((goal) => goal.trim())
            }

            // Create challenge log
            await challengesService.createLog(logData)

            // If user wants to copy to prep logs, create a prep log entry
            if (copyToPrepLogs) {
                try {
                    await prepLogsService.create({
                        title: `Day ${nextDay + 1} - ${challenge.name}`,
                        description: `Challenge Progress: ${
                            formData.progressText
                        }\n\nNext Goals:\n${formData.nextGoals
                            .filter((goal) => goal.trim())
                            .map((goal, index) => `${index + 1}. ${goal}`)
                            .join("\n")}`,
                        timeSpent: hours,
                        userId: userId
                    })
                    toast.success("Progress also added to Prep Logs! 📝")
                } catch (prepLogError) {
                    console.error("Error adding to prep logs:", prepLogError)
                    // Don't fail the whole operation if prep log creation fails
                }
            }

            toast.success("Progress logged successfully! 🎉")

            // Don't call onProgressLogged yet - wait until user is completely done
            // onProgressLogged();

            // Show social media preview instead of closing
            setShowSocialPreview(true)
        } catch (error) {
            console.error("Error logging progress:", error)
            toast.error("Failed to log progress")
        } finally {
            setLoading(false)
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
        const message = textareaRef.current?.value || generateSocialMessageFromTemplate(selectedTemplate)
        const encodedText = encodeURIComponent(message)
        const appUrl = process.env.NEXT_PUBLIC_BASE_URL

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

    const handleClose = () => {
        setFormData({
            progressText: "",
            hoursSpent: "",
            nextGoals: ["", "", ""]
        })
        setShowSocialPreview(false)
        setSelectedTemplate(0)

        // Now call onProgressLogged to refresh challenges data
        onProgressLogged()

        onClose()
    }

    const handleBackToForm = () => {
        setShowSocialPreview(false)
    }

    if (isChallengeCompleted) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className='sm:max-w-[500px] glass-dark border-primary/20'>
                    <DialogHeader>
                        <DialogTitle className='text-xl font-bold text-white flex items-center gap-2'>
                            <Trophy className='w-5 h-5 text-yellow-400' />
                            Challenge Completed! 🎉
                        </DialogTitle>
                        <DialogDescription className='text-gray-300'>
                            Congratulations! You've completed "{challenge.name}"
                        </DialogDescription>
                    </DialogHeader>

                    <Card className='bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'>
                        <CardContent className='pt-6 text-center'>
                            <Trophy className='w-16 h-16 text-yellow-400 mx-auto mb-4' />
                            <h3 className='text-lg font-semibold text-white mb-2'>
                                Amazing Achievement!
                            </h3>
                            <p className='text-gray-300 mb-4'>
                                You've successfully completed all{" "}
                                {challenge.totalDays} days of your challenge.
                                This is a testament to your dedication and
                                consistency!
                            </p>
                            <div className='text-sm text-gray-400'>
                                <p>Challenge: {challenge.name}</p>
                                <p>
                                    Category: {challenge.category || "General"}
                                </p>
                                <p>Total Days: {challenge.totalDays}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <DialogFooter>
                        <Button
                            onClick={handleClose}
                            className='bg-primary text-primary-foreground hover:bg-primary/90'>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-dark border-primary/20'>
                {!showSocialPreview ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-xl font-bold text-white flex items-center gap-2'>
                                <TrendingUp className='w-5 h-5 text-primary' />
                                Log Day {nextDay + 1} Progress
                            </DialogTitle>
                            <DialogDescription className='text-gray-300'>
                                Track your progress for "{challenge.name}"
                            </DialogDescription>
                        </DialogHeader>

                        <div className='space-y-6'>
                            {/* Progress Text */}
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='progressText'
                                    className='text-white'>
                                    What did you accomplish today? *
                                </Label>
                                <Textarea
                                    id='progressText'
                                    placeholder='Describe what you learned, practiced, or built today...'
                                    value={formData.progressText}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "progressText",
                                            e.target.value
                                        )
                                    }
                                    className='bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400'
                                    rows={3}
                                />
                            </div>

                            {/* Hours Spent */}
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='hoursSpent'
                                    className='text-white'>
                                    How many hours did you spend? *
                                </Label>
                                <Input
                                    id='hoursSpent'
                                    type='number'
                                    min='0.5'
                                    max='24'
                                    step='0.5'
                                    placeholder='2.5'
                                    value={formData.hoursSpent}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "hoursSpent",
                                            e.target.value
                                        )
                                    }
                                    className='bg-gray-800/50 border-gray-600 text-white'
                                />
                            </div>

                            {/* Next Goals */}
                            <div className='space-y-3'>
                                <Label className='text-white'>
                                    What are your goals for tomorrow?
                                </Label>
                                <div className='space-y-2'>
                                    {formData.nextGoals.map((goal, index) => (
                                        <Input
                                            key={index}
                                            placeholder={`Goal ${
                                                index + 1
                                            } (optional)`}
                                            value={goal}
                                            onChange={(e) =>
                                                handleNextGoalChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            className='bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400'
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Copy to Prep Logs */}
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='copyToPrepLogs'
                                    checked={copyToPrepLogs}
                                    onCheckedChange={(checked) =>
                                        setCopyToPrepLogs(checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor='copyToPrepLogs'
                                    className='text-white text-sm'>
                                    Also add this to my Prep Logs
                                </Label>
                            </div>

                            {/* Challenge Info */}
                            <Card className='bg-gray-800/30 border-gray-600'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-sm text-white'>
                                        Challenge Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-400'>
                                            Current Day:
                                        </span>
                                        <span className='text-white'>
                                            {challenge.currentDay + 1}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-400'>
                                            Next Day:
                                        </span>
                                        <span className='text-white'>
                                            {nextDay + 1}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-400'>
                                            Total Days:
                                        </span>
                                        <span className='text-white'>
                                            {challenge.totalDays}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-400'>
                                            Progress:
                                        </span>
                                        <span className='text-white'>
                                            {Math.round(
                                                (nextDay /
                                                    challenge.totalDays) *
                                                    100
                                            )}
                                            %
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={onClose}
                                variant='outline'
                                className='border-gray-300 text-white hover:bg-gray-100 hover:text-gray-900'>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    loading ||
                                    !formData.progressText.trim() ||
                                    !formData.hoursSpent
                                }
                                className='bg-primary text-primary-foreground hover:bg-primary/90'>
                                {loading ? "Logging..." : "Log Progress"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-xl font-bold text-white flex items-center gap-2'>
                                <Share2 className='w-5 h-5 text-primary' />
                                Share Your Progress
                            </DialogTitle>
                            <DialogDescription className='text-gray-300'>
                                Choose a template to share your Day {nextDay + 1}{" "}
                                progress
                            </DialogDescription>
                        </DialogHeader>

                        <div className='space-y-4'>
                            {/* Template Selection */}
                            <div className='space-y-3'>
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
                                            onClick={() => {
                                                setSelectedTemplate(index);
                                                // Update the textarea with new template
                                                setTimeout(() => {
                                                    if (textareaRef.current) {
                                                        textareaRef.current.value = generateSocialMessageFromTemplate(index);
                                                    }
                                                }, 100);
                                            }}>
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
                                                {selectedTemplate === index && (
                                                    <CheckCircle2 className='w-5 h-5 text-primary' />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Generated Message Preview */}
                            <div className='space-y-2'>
                                <Label className='text-white font-medium'>
                                    Your message:
                                </Label>
                                <textarea
                                    ref={textareaRef}
                                    className='w-full h-40 bg-gray-900/50 text-gray-200 p-4 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400'
                                    placeholder='Click here to edit your social media message...'
                                    defaultValue={generateSocialMessageFromTemplate(selectedTemplate)}
                                    style={{
                                        fontFamily: 'inherit',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-wrap gap-2'>
                                <Button
                                    onClick={() => {
                                        const message = textareaRef.current?.value || generateSocialMessageFromTemplate(selectedTemplate);
                                        copyToClipboard(message);
                                    }}
                                    variant='outline'
                                    size='sm'
                                    className='border-gray-600 text-white hover:bg-gray-700'>
                                    <Copy className='w-4 h-4 mr-2' />
                                    Copy Message
                                </Button>

                                <Button
                                    onClick={() => {
                                        const message = textareaRef.current?.value || generateSocialMessageFromTemplate(selectedTemplate);
                                        copyToClipboard(message);
                                        toast.success("Ready to share! 📱")
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
                                        onClick={() => shareToSocial("twitter")}
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

                        <DialogFooter>
                            <Button
                                onClick={handleClose}
                                className='bg-primary text-primary-foreground hover:bg-primary/90'>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ChallengeLogModal
