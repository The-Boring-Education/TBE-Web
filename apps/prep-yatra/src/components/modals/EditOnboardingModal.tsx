import { ExternalLink, Linkedin, Github } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    GOALS,
    COMPANY_TYPES,
    INTERVIEW_CATEGORIES
} from "@/constants/onboarding"
import { useAuth } from "@tbe/components"
import { useToast } from "@/hooks/use-toast"
import {
    OnboardingData,
    GoalType,
    CompanyType,
    InterviewCategory,
    ExperienceLevel
} from "@/types/onboarding"

interface EditOnboardingModalProps {
    isOpen: boolean
    onClose: () => void
    onUpdate: (data: OnboardingData) => void
    currentData?: any
    userId: string
}

const EditOnboardingModal: React.FC<EditOnboardingModalProps> = ({
    isOpen,
    onClose,
    onUpdate,
    currentData,
    userId
}) => {
    const { toast } = useToast()
    const { user } = useAuth()
    const [formData, setFormData] = useState<OnboardingData>({
        linkedInUrl: "",
        workDomain: "",
        name: "",
        username: "",
        experienceLevel: "fresher" as ExperienceLevel,
        goal: "6Months" as GoalType,
        targetCompanies: [] as CompanyType[],
        preferredCategories: [] as InterviewCategory[]
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (currentData) {
            const newFormData = {
                linkedInUrl: currentData.linkedInUrl || "",
                githubUrl: currentData.githubUrl || "",
                leetCodeUrl: currentData.leetCodeUrl || "",
                workDomain: currentData.workDomain || "",
                name: currentData.name || user?.name || "",
                username:
                    currentData.userName || user?.email?.split("@")[0] || "",
                experienceLevel: (currentData.prepYatra?.experienceLevel ||
                    "fresher") as ExperienceLevel,
                goal: (currentData.prepYatra?.goal || "6Months") as GoalType,
                targetCompanies: (currentData.prepYatra?.targetCompanies ||
                    []) as CompanyType[],
                preferredCategories: (currentData.prepYatra?.preferences
                    ?.interviewCategories || []) as InterviewCategory[]
            }
            setFormData(newFormData)
        } else {
            // Set default values for new users
            const defaultFormData = {
                linkedInUrl: "",
                githubUrl: "",
                leetCodeUrl: "",
                workDomain: "",
                name: user?.name || "",
                username: user?.email?.split("@")[0] || "",
                experienceLevel: "fresher" as ExperienceLevel,
                goal: "6Months" as GoalType,
                targetCompanies: [] as CompanyType[],
                preferredCategories: [] as InterviewCategory[]
            }
            setFormData(defaultFormData)
        }
    }, [currentData, user])

    const handleInputChange = (field: keyof OnboardingData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const toggleArrayField = (
        field: "targetCompanies" | "preferredCategories",
        value: CompanyType | InterviewCategory
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: (prev[field] as unknown[]).includes(value)
                ? (prev[field] as unknown[]).filter((item) => item !== value)
                : [...(prev[field] as unknown[]), value]
        }))
    }

    const handleSubmit = async () => {
        if (
            formData.targetCompanies.length === 0 ||
            formData.preferredCategories.length === 0
        ) {
            toast({
                title: "Validation Error",
                description:
                    "Please select at least one target company and one interview category.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const requestBody = {
                userId,
                name: formData.name,
                username: formData.username,
                goal: formData.goal,
                targetCompanies: formData.targetCompanies,
                preferredCategories: formData.preferredCategories,
                linkedInUrl: formData.linkedInUrl,
                githubUrl: formData.githubUrl,
                leetCodeUrl: formData.leetCodeUrl
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/onboarding`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                }
            )

            const result = await response.json()

            if (result.status) {
                toast({
                    title: "Success!",
                    description: "Onboarding details updated successfully."
                })
                // Use response data if available, otherwise use form data
                if (result.data?.prepYatraUser) {
                    const updatedData = {
                        goal: result.data.prepYatraUser.goal,
                        targetCompanies:
                            result.data.prepYatraUser.targetCompanies,
                        interviewCategories:
                            result.data.prepYatraUser.preferences
                                ?.interviewCategories || [],
                        focusAreas:
                            result.data.prepYatraUser.targetCompanies || []
                    }
                    onUpdate(updatedData as any)
                } else {
                    onUpdate(formData)
                }
                onClose()
            } else {
                throw new Error(
                    result.message || "Failed to update onboarding details"
                )
            }
        } catch (error) {
            console.error("Error updating onboarding details:", error)
            toast({
                title: "Error",
                description:
                    "Failed to update onboarding details. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700'>
                <DialogHeader>
                    <DialogTitle className='text-white text-xl'>
                        Edit Onboarding Details
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-6'>
                    {/* Social Links Section */}
                    <div className='space-y-3'>
                        <h3 className='text-lg font-semibold text-white'>
                            Social Links
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            {/* LinkedIn */}
                            <div>
                                <label
                                    htmlFor='linkedInUrl'
                                    className='block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2'>
                                    <Linkedin className='w-4 h-4' />
                                    LinkedIn URL
                                </label>
                                <input
                                    id='linkedInUrl'
                                    type='url'
                                    value={formData.linkedInUrl}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "linkedInUrl",
                                            e.target.value
                                        )
                                    }
                                    className='px-3 py-2 block w-full rounded-lg border border-gray-600 bg-gray-800/60 text-white focus:border-primary focus:ring-primary transition-all outline-none'
                                />
                            </div>
                            {/* GitHub */}
                            <div>
                                <label
                                    htmlFor='githubUrl'
                                    className='block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2'>
                                    <Github className='w-4 h-4' />
                                    GitHub URL
                                </label>
                                <input
                                    id='githubUrl'
                                    type='url'
                                    value={formData.githubUrl || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "githubUrl",
                                            e.target.value
                                        )
                                    }
                                    className='px-3 py-2 block w-full rounded-lg border border-gray-600 bg-gray-800/60 text-white focus:border-primary focus:ring-primary transition-all outline-none'
                                />
                            </div>
                            {/* LeetCode */}
                            <div>
                                <label
                                    htmlFor='leetCodeUrl'
                                    className='block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2'>
                                    <ExternalLink className='w-4 h-4' />
                                    LeetCode URL
                                </label>
                                <input
                                    id='leetCodeUrl'
                                    type='url'
                                    value={formData.leetCodeUrl || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "leetCodeUrl",
                                            e.target.value
                                        )
                                    }
                                    className='px-3 py-2 block w-full rounded-lg border border-gray-600 bg-gray-800/60 text-white focus:border-primary focus:ring-primary transition-all outline-none'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Goal Selection */}
                    <div className='space-y-3'>
                        <h3 className='text-lg font-semibold text-white'>
                            Goal Timeline 🎯
                        </h3>
                        <div className='space-y-2'>
                            {GOALS.map((goal) => (
                                <button
                                    key={goal.value}
                                    type='button'
                                    onClick={() =>
                                        handleInputChange("goal", goal.value)
                                    }
                                    className={`w-full p-3 border-2 rounded-lg text-left transition-all relative ${
                                        formData.goal === goal.value
                                            ? "border-primary bg-primary/20"
                                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                                    }`}>
                                    {goal.popular && (
                                        <span className='absolute top-1 right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full'>
                                            Popular
                                        </span>
                                    )}
                                    <div className='flex items-center space-x-3'>
                                        <span className='text-xl'>
                                            {goal.icon}
                                        </span>
                                        <div>
                                            <div className='font-medium text-white'>
                                                {goal.label}
                                            </div>
                                            <div className='text-sm text-gray'>
                                                {goal.description}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Companies */}
                    <div className='space-y-3'>
                        <h3 className='text-lg font-semibold text-white'>
                            Target Companies 🏢
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            {COMPANY_TYPES.map((company) => (
                                <button
                                    key={company.value}
                                    type='button'
                                    onClick={() =>
                                        toggleArrayField(
                                            "targetCompanies",
                                            company.value
                                        )
                                    }
                                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                                        formData.targetCompanies.includes(
                                            company.value
                                        )
                                            ? "border-primary bg-primary/20"
                                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                                    }`}>
                                    <div className='text-xl mb-1'>
                                        {company.icon}
                                    </div>
                                    <div className='font-medium text-white text-sm mb-1'>
                                        {company.label}
                                    </div>
                                    <div className='text-xs text-gray'>
                                        {company.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className='text-sm text-gray-400 text-center'>
                            {formData.targetCompanies.length} selected
                        </div>
                    </div>

                    {/* Interview Categories */}
                    <div className='space-y-3'>
                        <h3 className='text-lg font-semibold text-white'>
                            Interview Category 📚
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            {INTERVIEW_CATEGORIES.map((category) => (
                                <button
                                    key={category.value}
                                    type='button'
                                    onClick={() =>
                                        toggleArrayField(
                                            "preferredCategories",
                                            category.value
                                        )
                                    }
                                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                                        formData.preferredCategories.includes(
                                            category.value
                                        )
                                            ? "border-primary bg-primary/20"
                                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                                    }`}>
                                    <div className='text-xl mb-1'>
                                        {category.icon}
                                    </div>
                                    <div className='font-medium text-white text-sm mb-1'>
                                        {category.label}
                                    </div>
                                    <div className='text-xs text-gray'>
                                        {category.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className='text-sm text-gray-400 text-center'>
                            {formData.preferredCategories.length} selected
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3 pt-4'>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90'>
                            {loading ? "Updating..." : "Update Details"}
                        </Button>
                        <Button
                            onClick={onClose}
                            variant='outline'
                            className='flex-1 border-gray-600 text-white hover:bg-gray-800 hover:text-white'>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditOnboardingModal
