import { useState, useEffect } from "react"
import type {
    UseOnboardingProps,
    UseOnboardingReturn,
    BaseUser} from "@tbe/types";
import {
    OnboardingProductConfig,
    OnboardingFieldConfig
} from "@tbe/types"
import {
    getOnboardingConfig,
    isValidOnboardingProduct
} from "@tbe/config" // FIXME: REFACTOR
import { sendRequest, trackEvent } from "@tbe/utils"

/**
 * useOnboarding Hook
 *
 * Extracted from onboarding app and made reusable
 * Handles complete onboarding flow for any TBE product
 */
export default function useOnboarding({
    userId,
    productId,
    redirect,
    token,
    from
}: UseOnboardingProps): UseOnboardingReturn {
    const [user, setUser] = useState<BaseUser | null>(null)
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<Record<string, unknown>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState(true)
    const [usernameChecking, setUsernameChecking] = useState(false)

    const config = getOnboardingConfig(productId)

    // Get unique step numbers that have at least one field
    const stepNumbersWithFields = config
        ? Array.from(new Set(config.fields.map((f) => f.step))).sort(
              (a, b) => a - b
          )
        : []
    const totalSteps = stepNumbersWithFields.length

    // Map visible step index (1-based) to actual step number
    const getActualStepNumber = (visibleStep: number) =>
        stepNumbersWithFields[visibleStep - 1]

    // Reset form when product changes
    useEffect(() => {
        setForm({})
        setStep(1)
    }, [productId])

    // Fetch user data and prefill form
    useEffect(() => {
        async function fetchUser() {
            if (!userId || !isValidOnboardingProduct(productId)) {
                setLoading(false)
                return
            }

            setLoading(true)

            try {
                const response = await sendRequest({
                    url: `/api/v1/user?userId=${userId}`,
                    method: "GET",
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                })

                if (response.success && response.data) {
                    const userData = response.data as BaseUser
                    setUser(userData)

                    if (config) {
                        // Prefill form using product configuration
                        const prefillData: Record<string, unknown> = {}
                        config.fields.forEach((field) => {
                            if (field.prefill?.fromUser) {
                                prefillData[field.name] =
                                    field.prefill.fromUser(userData)
                            } else {
                                prefillData[field.name] =
                                    field.prefill?.defaultValue ||
                                    (field.type === "multiselect" ? [] : "")
                            }
                        })
                        setForm(prefillData)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user:", err)
                setError("Failed to load user data")
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [userId, productId, token, config])

    const handleNext = () => {
        try {
            trackEvent("onboarding_next", {
                category: "onboarding",
                label: `${productId}_step_${step}`,
                value: step
            })
        } catch {}

        setStep((s) => Math.min(s + 1, totalSteps))
    }

    const handleBack = () => {
        try {
            trackEvent("onboarding_previous", {
                category: "onboarding",
                label: `${productId}_step_${step}`,
                value: step
            })
        } catch {}

        setStep((s) => Math.max(s - 1, 1))
    }

    const handleFinish = async () => {
        if (!config) {
            setError("Invalid product configuration")
            return
        }

        setSubmitting(true)
        setError("")

        try {
            trackEvent("onboarding_submit", {
                category: "onboarding",
                label: productId
            })
        } catch {}

        try {
            const payload = config.api.transformPayload(form, userId, from)
            const endpoint =
                typeof config.api.endpoint === "function"
                    ? config.api.endpoint(userId)
                    : config.api.endpoint

            const response = await sendRequest({
                url: endpoint,
                method: config.api.method,
                data: payload,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })

            if (response.success) {
                try {
                    trackEvent("onboarding_complete", {
                        category: "onboarding",
                        label: productId
                    })
                } catch {}

                // Redirect to specified URL
                if (redirect) {
                    window.location.href = redirect
                }
            } else {
                throw new Error(response.error || "Submission failed")
            }
        } catch (err: any) {
            const errorMessage = err.message || "Submission failed"
            setError(errorMessage)

            try {
                trackEvent("onboarding_error", {
                    category: "onboarding",
                    label: `${productId}_${errorMessage}`
                })
            } catch {}
        } finally {
            setSubmitting(false)
        }
    }

    const isFieldValid = () => {
        if (!config) return false

        const actualStep = getActualStepNumber(step)
        const currentFields = config.fields.filter((f) => f.step === actualStep)

        // All required fields for this step must be valid
        return currentFields.every((currentField) => {
            if (!currentField.required) return true

            const val = form[currentField.name]

            if (currentField.type === "multiselect") {
                return Array.isArray(val) && val.length > 0
            }

            const hasValue = !!val && val.toString().trim() !== ""

            if (currentField.checkAvailability && hasValue) {
                return usernameAvailable && !usernameChecking
            }

            return hasValue
        })
    }

    return {
        user,
        step,
        form,
        setForm,
        loading,
        error,
        submitting,
        config,
        totalSteps,
        handleNext,
        handleBack,
        handleFinish,
        isFieldValid: isFieldValid(),
        setUsernameAvailability: setUsernameAvailable,
        setUsernameChecking
    }
}
