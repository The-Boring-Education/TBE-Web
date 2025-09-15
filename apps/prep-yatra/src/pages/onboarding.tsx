import {ChevronLeft, ChevronRight} from "lucide-react";
import {useRouter} from "next/router";

import StepBasicInfo from "@/components/onboarding/StepBasicInfo";
import StepCategories from "@/components/onboarding/StepCategories";
import StepCompanies from "@/components/onboarding/StepCompanies";
import StepExperience from "@/components/onboarding/StepExperience";
import StepGoal from "@/components/onboarding/StepGoal";
import StepProfile from "@/components/onboarding/StepProfile";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {useOnboarding} from "@/hooks/useOnboarding";

// Lazy load step components

const TOTAL_STEPS = 6;

const Onboarding = () => {
    const router = useRouter();
    const {
        currentStep,
        formData,
        handleInputChange,
        toggleArrayField,
        isStepValid,
        handleNext,
        handlePrevious,
        handleSubmit,
        loading
    } = useOnboarding();

    const showStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StepBasicInfo
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
            case 2:
                return (
                    <StepProfile
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
            case 3:
                return (
                    <StepExperience
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
            case 4:
                return (
                    <StepGoal
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
            case 5:
                return (
                    <StepCompanies
                        formData={formData}
                        toggleArrayField={toggleArrayField}
                    />
                );
            case 6:
                return (
                    <StepCategories
                        formData={formData}
                        toggleArrayField={toggleArrayField}
                    />
                );
            default:
                return (
                    <StepBasicInfo
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return "Basic Information";
            case 2:
                return "Profile Links";
            case 3:
                return "Experience Level";
            case 4:
                return "Your Goal";
            case 5:
                return "Target Companies";
            case 6:
                return "Interview Categories";
            default:
                return "Getting Started";
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 1:
                return "Let's start with your basic details";
            case 2:
                return "Add your professional profiles";
            case 3:
                return "Tell us about your experience";
            case 4:
                return "What's your preparation timeline?";
            case 5:
                return "Which companies are you targeting?";
            case 6:
                return "What type of interviews are you preparing for?";
            default:
                return "Let's get you set up";
        }
    };

    const onSubmitHandler = async () => {
        try {
            await handleSubmit();
            router.push("/dashboard");
        } catch (error) {
            console.error("Onboarding submission failed:", error);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl'>
                <Card className='glass-dark border-gray-700'>
                    <CardHeader className='text-center'>
                        <div className='mb-6'>
                            <span className='text-3xl font-bold text-primary'>
                                PrepYatra
                            </span>
                            <p className='text-gray text-sm mt-1'>
                                by The Boring Education
                            </p>
                        </div>

                        <CardTitle className='text-2xl text-white'>
                            {getStepTitle()}
                        </CardTitle>
                        <CardDescription className='text-gray'>
                            {getStepDescription()}
                        </CardDescription>

                        <div className='mt-6'>
                            <div className='flex justify-between text-sm text-gray-400 mb-2'>
                                <span>
                                    Step {currentStep} of {TOTAL_STEPS}
                                </span>
                                <span>
                                    {Math.round(
                                        (currentStep / TOTAL_STEPS) * 100
                                    )}
                                    %
                                </span>
                            </div>
                            <Progress
                                value={(currentStep / TOTAL_STEPS) * 100}
                                className='h-2'
                            />
                        </div>
                    </CardHeader>

                    <CardContent className='p-6'>
                        <div className='space-y-6'>{showStep()}</div>

                        <div className='flex justify-between mt-8'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handlePrevious}
                                disabled={currentStep === 1 || loading}
                                className='border-gray-600 text-gray hover:bg-gray-700'>
                                <ChevronLeft className='w-4 h-4 mr-2' />
                                Previous
                            </Button>

                            {currentStep === TOTAL_STEPS ? (
                                <Button
                                    type='button'
                                    onClick={onSubmitHandler}
                                    disabled={!isStepValid() || loading}
                                    className='bg-primary text-primary-foreground hover:bg-primary/90'>
                                    {loading
                                        ? "Setting up..."
                                        : "Complete Setup"}
                                </Button>
                            ) : (
                                <Button
                                    type='button'
                                    onClick={handleNext}
                                    disabled={!isStepValid() || loading}
                                    className='bg-primary text-primary-foreground hover:bg-primary/90'>
                                    Next
                                    <ChevronRight className='w-4 h-4 ml-2' />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Onboarding;
