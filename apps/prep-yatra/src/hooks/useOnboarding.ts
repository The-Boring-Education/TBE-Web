import { useRouter } from "next/router"
import { useState, useEffect } from "react"

import { useAuth } from "@/contexts/useAuth"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"
import { OnboardingData } from "@/types/onboarding"

// Debug function to help identify issues
const debugOnboardingConfig = () => {
    console.log("=== Onboarding Debug Info ===")
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
    console.log("Environment:", process.env.NODE_ENV)
    console.log("User Agent:", navigator.userAgent)
    console.log("Online Status:", navigator.onLine)
    console.log("===========================")
}

export function useOnboarding() {
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth()
    const [centralUserId, setCentralUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = 6

    const [formData, setFormData] = useState<OnboardingData>({
        linkedInUrl: "",
        workDomain: "",
        name: "",
        username: "",
        experienceLevel: "fresher",
        goal: "6Months",
        targetCompanies: [],
        preferredCategories: []
    })

    useEffect(() => {
        const checkAuthAndFetchCentralUser = async () => {
            if (!user) {
                router.push("/auth")
                return
            }

            // Debug configuration
            debugOnboardingConfig()

            try {
                console.log("Checking user in central DB:", user.email)
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user?email=${user.email}`
                )

                if (!res.ok) {
                    console.error(
                        "User verification failed with status:",
                        res.status
                    )
                    const errorText = await res.text()
                    console.error(
                        "User verification error response:",
                        errorText
                    )
                    throw new Error(
                        `User verification failed: ${res.status} - ${errorText}`
                    )
                }

                const result = await res.json()

                if (!result?.status || !result?.data?._id) {
                    console.error("User not found in central DB:", result)
                    throw new Error("User not found in central DB")
                }

                console.log("User verified successfully:", result.data._id)
                setCentralUserId(result.data._id)
            } catch (error) {
                console.error("Error checking user:", error)
                let errorMessage = "Could not verify user. Please try again."

                if (error instanceof Error) {
                    if (error.message.includes("fetch")) {
                        errorMessage =
                            "Network error. Please check your connection and try again."
                    } else if (error.message.includes("User not found")) {
                        errorMessage =
                            "User account not found. Please contact support."
                    } else {
                        errorMessage = error.message
                    }
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                })
                router.push("/auth")
            }
        }

        checkAuthAndFetchCentralUser()
    }, [router, user])

    const handleInputChange = (
        field: keyof OnboardingData,
        value: string | string[]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const toggleArrayField = (
        field: "targetCompanies" | "preferredCategories",
        value
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter((item) => item !== value)
                : [...prev[field], value]
        }))
    }

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.workDomain
            case 2:
                return formData.name.trim() && formData.username.trim()
            case 3:
                return formData.experienceLevel
            case 4:
                return formData.goal
            case 5:
                return formData.targetCompanies.length > 0
            case 6:
                return formData.preferredCategories.length > 0
            default:
                return false
        }
    }

    const handleNext = () => {
        if (currentStep < totalSteps) {
            try {
                trackEvent("onboarding_next", {
                    category: "onboarding",
                    step: currentStep
                })
            } catch {}
            setCurrentStep(currentStep + 1)
        } else {
            handleSubmit()
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            try {
                trackEvent("onboarding_previous", {
                    category: "onboarding",
                    step: currentStep
                })
            } catch {}
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        if (!user || !centralUserId) {
            return
        }

        // Validate form data before submission
        if (!formData.workDomain) {
            toast({
                title: "Validation Error",
                description: "Please fill in your work experience and domain.",
                variant: "destructive"
            })
            return
        }

        if (!formData.name?.trim() || !formData.username?.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in your name and username.",
                variant: "destructive"
            })
            return
        }

        if (!formData.goal) {
            toast({
                title: "Validation Error",
                description: "Please select your goal.",
                variant: "destructive"
            })
            return
        }

        if (formData.targetCompanies.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please select at least one target company.",
                variant: "destructive"
            })
            return
        }

        if (formData.preferredCategories.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please select at least one preferred category.",
                variant: "destructive"
            })
            return
        }

        try {
            trackEvent("onboarding_submit", {
                category: "onboarding",
                step: currentStep
            })
        } catch {}

        const maxRetries = 3
        const attemptOnboarding = async (
            attempt: number = 1
        ): Promise<void> => {
            try {
                setLoading(true)

                // Step 1: Update central user
                console.log(
                    `Attempt ${attempt}: Starting Step 1: Central user update`
                )
                const step1Response = await fetch(
                    `${
                        process.env.NEXT_PUBLIC_API_URL
                    }/user/onboarding?userId=${centralUserId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            workDomain: formData.workDomain,
                            linkedInUrl: formData.linkedInUrl
                        })
                    }
                )

                if (!step1Response.ok) {
                    console.error(
                        "Step 1 failed with status:",
                        step1Response.status
                    )
                    const errorText = await step1Response.text()
                    console.error("Step 1 error response:", errorText)
                    throw new Error(
                        `Step 1 failed: ${step1Response.status} - ${errorText}`
                    )
                }

                const step1Result = await step1Response.json()
                if (!step1Result.status) {
                    throw new Error(
                        step1Result.message || "Step 1 onboarding failed"
                    )
                }
                console.log("Step 1 completed successfully")

                // Step 2-6: PrepYatra onboarding
                console.log(
                    `Attempt ${attempt}: Starting Step 2: PrepYatra onboarding`
                )
                const requestBody = {
                    userId: centralUserId,
                    name: user.name,
                    email: user.email,
                    username: formData.username,
                    experienceLevel: formData.experienceLevel,
                    goal: formData.goal,
                    targetCompanies: formData.targetCompanies,
                    preferredCategories: formData.preferredCategories
                }

                console.log("PrepYatra request body:", requestBody)

                const prepYatraResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/prepyatra/onboarding`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    }
                )

                if (!prepYatraResponse.ok) {
                    console.error(
                        "PrepYatra onboarding failed with status:",
                        prepYatraResponse.status
                    )
                    const errorText = await prepYatraResponse.text()
                    console.error("PrepYatra error response:", errorText)
                    throw new Error(
                        `PrepYatra onboarding failed: ${prepYatraResponse.status} - ${errorText}`
                    )
                }

                const prepYatraResult = await prepYatraResponse.json()
                if (!prepYatraResult.status) {
                    throw new Error(
                        prepYatraResult.message || "PrepYatra onboarding failed"
                    )
                }
                console.log("PrepYatra onboarding completed successfully")

                // Reset retry count on success
                setRetryCount(0)

                toast({
                    title: "Welcome to PrepYatra!",
                    description: "Your profile has been set up successfully."
                })
                try {
                    trackEvent("onboarding_complete", {
                        category: "onboarding",
                        totalSteps
                    })
                } catch {}
                router.push("/dashboard")
            } catch (error) {
                console.error(`Onboarding error (attempt ${attempt}):`, error)
                try {
                    trackEvent("onboarding_error", {
                        category: "onboarding",
                        attempt
                    })
                } catch {}

                // If we haven't exceeded max retries and it's a network error, retry
                if (
                    attempt < maxRetries &&
                    error instanceof Error &&
                    (error.message.includes("fetch") ||
                        error.message.includes("Network"))
                ) {
                    setRetryCount(attempt)
                    toast({
                        title: "Retrying...",
                        description: `Attempt ${attempt + 1} of ${maxRetries}`,
                        variant: "default"
                    })

                    // Wait 2 seconds before retrying
                    await new Promise((resolve) => setTimeout(resolve, 2000))
                    return attemptOnboarding(attempt + 1)
                }

                // Provide more specific error messages based on the error
                let errorMessage =
                    "Failed to complete onboarding. Please try again."

                if (error instanceof Error) {
                    if (error.message.includes("Step 1 failed")) {
                        errorMessage =
                            "Failed to update your work information. Please check your details and try again."
                    } else if (
                        error.message.includes("PrepYatra onboarding failed")
                    ) {
                        errorMessage =
                            "Failed to save your preferences. Please try again."
                    } else if (error.message.includes("fetch")) {
                        errorMessage =
                            "Network error. Please check your connection and try again."
                    } else if (error.message.includes("User not found")) {
                        errorMessage =
                            "User verification failed. Please log in again."
                    } else {
                        errorMessage = error.message
                    }
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        await attemptOnboarding()
    }

    return {
        user,
        loading,
        currentStep,
        totalSteps,
        formData,
        setFormData,
        handleInputChange,
        toggleArrayField,
        isStepValid,
        handleNext,
        handlePrevious,
        handleSubmit,
        retryCount
    }
}
