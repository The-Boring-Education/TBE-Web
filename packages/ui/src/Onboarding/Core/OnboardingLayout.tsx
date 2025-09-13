import React from "react"
import {
    StandardizedNavbar,
    StandardizedFooter,
    OnboardingProgressBar,
    Button,
    Alert,
    LoadingSpinner,
    Text
} from "@tbe/ui"

interface OnboardingLayoutProps {
    children: React.ReactNode
    step: number
    totalSteps: number
    onBack: () => void
    onNext: () => void
    onFinish: () => void
    isFieldValid: boolean
    submitting: boolean
    error?: string
    config?: any
}

/**
 * OnboardingLayout Component
 *
 * Standardized layout for onboarding flows using shared TBE components
 * Consistent with platform design system
 */
export default function OnboardingLayout({
    children,
    step,
    totalSteps,
    onBack,
    onNext,
    onFinish,
    isFieldValid,
    submitting,
    error,
    config
}: OnboardingLayoutProps) {
    const isFirstStep = step === 1
    const isLastStep = step === totalSteps

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col'>
            {/* Standardized Navbar */}
            <StandardizedNavbar variant='onboarding' appName='Get Started' />

            {/* Main Content */}
            <main className='flex-1 flex items-center justify-center p-4'>
                <div className='w-full max-w-md'>
                    {/* Progress Bar */}
                    <OnboardingProgressBar
                        step={step}
                        total={totalSteps}
                        className='mb-8'
                    />

                    {/* Content Card */}
                    <div className='bg-white rounded-xl shadow-lg p-8 border border-gray-100'>
                        {/* Header */}
                        {config?.title && (
                            <div className='text-center mb-6'>
                                <Text
                                    variant='h3'
                                    className='font-bold text-gray-900 mb-2'>
                                    {config.title}
                                </Text>
                                {config.description && (
                                    <Text
                                        variant='body1'
                                        className='text-gray-600'>
                                        {config.description}
                                    </Text>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Alert variant='destructive' className='mb-6'>
                                {error}
                            </Alert>
                        )}

                        {/* Form Content */}
                        <div className='mb-8'>{children}</div>

                        {/* Navigation Buttons */}
                        <div className='flex justify-between items-center space-x-4'>
                            <Button
                                variant='outline'
                                onClick={onBack}
                                disabled={isFirstStep || submitting}
                                className='px-6'>
                                Back
                            </Button>

                            <div className='flex-1 flex justify-end'>
                                {isLastStep ? (
                                    <Button
                                        variant='default'
                                        onClick={onFinish}
                                        disabled={!isFieldValid || submitting}
                                        className='px-8'>
                                        {submitting ? (
                                            <>
                                                <LoadingSpinner
                                                    size='sm'
                                                    className='mr-2'
                                                />
                                                Finishing...
                                            </>
                                        ) : (
                                            "Complete Setup"
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        variant='default'
                                        onClick={onNext}
                                        disabled={!isFieldValid || submitting}
                                        className='px-8'>
                                        {submitting ? (
                                            <>
                                                <LoadingSpinner
                                                    size='sm'
                                                    className='mr-2'
                                                />
                                                Processing...
                                            </>
                                        ) : (
                                            "Next"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Step Indicator Text */}
                        <div className='text-center mt-6'>
                            <Text variant='caption' className='text-gray-500'>
                                Step {step} of {totalSteps} •{" "}
                                {Math.round(((step - 1) / totalSteps) * 100)}%
                                Complete
                            </Text>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className='text-center mt-6'>
                        <Text variant='body2' className='text-gray-600'>
                            Need help? Contact us at{" "}
                            <a
                                href='mailto:support@theboringeducation.com'
                                className='text-blue-600 hover:text-blue-800 underline'>
                                support@theboringeducation.com
                            </a>
                        </Text>
                    </div>
                </div>
            </main>

            {/* Standardized Footer */}
            <StandardizedFooter variant='onboarding' showProducts={false} />
        </div>
    )
}
