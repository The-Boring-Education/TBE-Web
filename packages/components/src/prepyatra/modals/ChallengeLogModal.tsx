import { Share2, Copy, TrendingUp, CheckCircle2, Trophy, Linkedin, Twitter, Facebook, X, LogOut } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { InputField  } from "../ui/input"
import { Label } from "../ui/label"
    import { Textarea } from "../ui/textarea"
import { challengesService } from "@tbe/services"
import { prepLogsService } from "@tbe/services"
import type { Challenge } from "@tbe/types"
import Button from "../../common/Buttons/Button"    
import Text from "../../common/Typography/Text"
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
        const message =
            textareaRef.current?.value ||
            generateSocialMessageFromTemplate(selectedTemplate)
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
                <DialogContent className='sm:max-w-[500px] glass border-greyLight'>
                    <DialogHeader>
                        <DialogTitle className='text-xl font-bold text-contentLight flex items-center gap-2'>
                            <Trophy className='w-5 h-5 text-yellow-400' />
                            Challenge Completed! 🎉
                        </DialogTitle>
                        <DialogDescription className='text-greyDark'>
                            Congratulations! You've completed "{challenge.name}"
                        </DialogDescription>
                    </DialogHeader>

                    <Card className='bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'>
                        <CardContent className='pt-6 text-center'>
                            <Trophy className='w-16 h-16 text-yellow-400 mx-auto mb-4' />
                            <h3 className='text-lg font-semibold text-contentLight mb-2'>
                                Amazing Achievement!
                            </h3>
                            <p className='text-greyDark mb-4'>
                                You've successfully completed all{" "}
                                {challenge.totalDays} days of your challenge.
                                This is a testament to your dedication and
                                consistency!
                            </p>
                            <div className='text-sm text-greyDark'>
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
                            variant="PRIMARY"
                            size="SMALL"
                            text="Close"
                            icon={<X className="w-4 h-4 mr-1" />}
                            className='text-sm h-5'
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass border-greyLight'>
                {!showSocialPreview ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className='text-xl font-bold text-contentLight flex items-center gap-2'>
                                Log Day {nextDay + 1} Progress
                            </DialogTitle>
                            <DialogDescription className='text-greyDark'>
                                Track your progress for "{challenge.name}"
                            </DialogDescription>
                        </DialogHeader>

                        <div className='space-y-6'>
                            {/* Progress Text */}
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='progressText'
                                    className='text-contentLight'>
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
                                    className='bg-white/50 border-greyLight text-contentLight placeholder:text-greyDark'
                                    rows={3}
                                />
                            </div>

                            {/* Hours Spent */}
                            <div className='space-y-2'>
                                <InputField
                                    field='hoursSpent'
                                    label='How many hours did you spend? *'
                                    type='number'
                                    value={formData.hoursSpent}
                                    onChange={(field, value) =>
                                        handleInputChange(field, value)
                                    }
                                    className='bg-white/50 border-greyLight text-contentLight'
                                />
                            </div>

                            {/* Next Goals */}
                            <div className='space-y-3'>
                                <Label className='text-contentLight'>
                                    What are your goals for tomorrow?
                                </Label>
                                <div className='space-y-2'>
                                    {formData.nextGoals.map((goal, index) => (
                                        <InputField
                                            field={`nextGoal-${index}`}
                                            label={`Goal ${index + 1} (optional)`}
                                            key={index}
                                            value={goal}
                                            onChange={(field, value) =>
                                                handleNextGoalChange(index, value)
                                            }
                                            className='bg-white/50 border-greyLight text-contentLight placeholder:text-greyDark'
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Copy to Prep Logs */}
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='copyToPrepLogs'
                                    checked={copyToPrepLogs}
                                    onCheckedChange={(checked:any) =>
                                        setCopyToPrepLogs(checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor='copyToPrepLogs'
                                    className='text-contentLight text-sm'>
                                    Also add this to my Prep Logs
                                </Label>
                            </div>

                            {/* Challenge Info */}
                            <Card className='bg-white/30 border-greyLight'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-sm text-contentLight'>
                                        Challenge Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-greyDark'>
                                            Current Day:
                                        </span>
                                        <span className='text-contentLight'>
                                            {challenge.currentDay + 1}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-greyDark'>
                                            Next Day:
                                        </span>
                                        <span className='text-contentLight'>
                                            {nextDay + 1}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-greyDark'>
                                            Total Days:
                                        </span>
                                        <span className='text-contentLight'>
                                            {challenge.totalDays}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-greyDark'>
                                            Progress:
                                        </span>
                                        <span className='text-contentLight'>
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
                                variant="OUTLINE"
                                size="SMALL"
                                text="Cancel"
                                className='text-sm h-5'
                            />
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    loading ||
                                    !formData.progressText.trim() ||
                                    !formData.hoursSpent
                                }
                                variant="PRIMARY"
                                size="SMALL"
                                text={loading ? "Logging..." : "Log Progress"}
                                className='text-sm h-5'
                            />
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
                                Choose a template to share your Day{" "}
                                {nextDay + 1} progress
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
                                                setSelectedTemplate(index)
                                                // Update the textarea with new template
                                                setTimeout(() => {
                                                    if (textareaRef.current) {
                                                        textareaRef.current.value =
                                                            textareaRef.current.value || ""
                                                            generateSocialMessageFromTemplate(
                                                                index
                                                            )
                                                    }
                                                }, 100)
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
                                    defaultValue={generateSocialMessageFromTemplate(
                                        selectedTemplate
                                    )}
                                    style={{
                                        fontFamily: "inherit",
                                        fontSize: "14px",
                                        lineHeight: "1.5",
                                        whiteSpace: "pre-wrap"
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex flex-wrap gap-2'>
                                <Button
                                    onClick={() => {
                                        const message =
                                            textareaRef.current?.value ||
                                            generateSocialMessageFromTemplate(
                                                selectedTemplate
                                            )
                                        copyToClipboard(message || "")
                                    }}
                                    variant="OUTLINE"
                                    size="SMALL"
                                    text="Copy Message"
                                    icon={<Copy className="w-4 h-4 mr-1" />}
                                    className='text-sm h-5'
                                />

                                <Button
                                    onClick={() => {
                                        const message =
                                            textareaRef.current?.value ||
                                            generateSocialMessageFromTemplate(
                                                selectedTemplate
                                            )
                                        copyToClipboard(message || "")
                                        toast.success("Ready to share! 📱")
                                    }}
                                    variant="OUTLINE"
                                    size="SMALL"
                                    text="Copy & Share"
                                    icon={<Share2 className="w-4 h-4 mr-1" />}
                                    className='text-sm h-5'
                                />
                            </div>

                            {/* Direct Social Media Posting */}
                            <div className='space-y-2'>
                                <Label className='text-white font-medium'>
                                    Post directly to:
                                </Label>
                                <div className='flex flex-wrap gap-2'>
                                    <Button
                                        onClick={() => shareToSocial("twitter")}
                                        variant="OUTLINE"
                                        size="SMALL"
                                        text="Twitter"
                                        icon={<Twitter className="w-4 h-4 mr-1" />}
                                        className='text-sm h-5'
                                    />

                                    <Button
                                        onClick={() =>
                                            shareToSocial("linkedin")
                                        }
                                                variant="OUTLINE"
                                        size="SMALL"
                                        text="LinkedIn"
                                        icon={<Linkedin className="w-4 h-4 mr-1" />}
                                        className='text-sm h-5'
                                    />

                                    <Button
                                        onClick={() =>
                                            shareToSocial("facebook")
                                        }
                                                variant="OUTLINE"
                                        size="SMALL"
                                        text="Facebook"
                                        icon={<Facebook className="w-4 h-4 mr-1" />}
                                        className='text-sm h-5'
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleClose}
                                variant="PRIMARY"
                                size="SMALL"
                                text="Done"
                                icon={<CheckCircle2 className="w-4 h-4 mr-1" />}
                                className='text-sm h-5'
                            />
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ChallengeLogModal
