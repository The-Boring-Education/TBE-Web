import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Eye,
    Lightbulb,
    Sparkles
} from "lucide-react"
import { useRouter } from "next/router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { getAudienceBadgeColor } from "@/lib/utils"
import type { UseResumeBuilderReturn } from "@/types/builder"

interface BuilderMainProps {
    builder: UseResumeBuilderReturn
}

export default function BuilderMain({ builder }: BuilderMainProps) {
    const router = useRouter()
    const {
        currentStep,
        currentStepData,
        progress,
        isLastStep,
        calculateStepScore,
        calculateOverallScore,
        updateChecklistItem,
        setCurrentStep,
        setShowResult
    } = builder

    return (
        <div className='min-h-screen bg-white'>
            {/* Progress Bar */}
            <div className='sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 transition-all duration-300'>
                <div className='container mx-auto'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-gray-600'>
                            Step {currentStep + 1} of {builder.stepData.length}
                        </span>
                        <span className='text-sm font-medium text-purple-600'>
                            Overall Score: {calculateOverallScore()}%
                        </span>
                    </div>
                    <Progress
                        value={progress}
                        className='h-3 transition-all duration-500'
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className='container mx-auto px-6 py-8'>
                <div className='max-w-4xl mx-auto'>
                    {/* Step Header */}
                    <div className='text-center mb-8 animate-fade-in'>
                        <h1 className='text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                            {currentStepData.title}
                        </h1>
                        <p className='text-xl text-gray-600 mb-4'>
                            {currentStepData.description}
                        </p>
                        <Badge
                            className={`${getAudienceBadgeColor(
                                currentStepData.audienceType
                            )} transition-all duration-300`}>
                            {currentStepData.audience}
                        </Badge>
                    </div>

                    {/* Content Cards */}
                    <div className='space-y-6 animate-fade-in'>
                        {/* Importance */}
                        <Card className='transition-all duration-300 hover:shadow-lg'>
                            <CardContent className='p-6'>
                                <div className='flex items-start gap-3'>
                                    <Lightbulb className='w-6 h-6 text-amber-500 mt-1' />
                                    <div>
                                        <h3 className='font-semibold text-amber-800 mb-2'>
                                            Why This Matters
                                        </h3>
                                        <p className='text-amber-700'>
                                            {currentStepData.importance}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recruiter's POV */}
                        <Card className='transition-all duration-300 hover:shadow-lg'>
                            <CardContent className='p-6'>
                                <div className='flex items-start gap-3'>
                                    <Eye className='w-6 h-6 text-blue-500 mt-1' />
                                    <div>
                                        <h3 className='font-semibold text-blue-800 mb-2'>
                                            Recruiter's Perspective
                                        </h3>
                                        <p className='text-blue-700'>
                                            {currentStepData.recruitersPoV}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pro Tips */}
                        <Card className='transition-all duration-300 hover:shadow-lg'>
                            <CardContent className='p-6'>
                                <div className='flex items-start gap-3'>
                                    <CheckCircle className='w-6 h-6 text-green-500 mt-1' />
                                    <div>
                                        <h3 className='font-semibold text-green-800 mb-3'>
                                            Pro Tips
                                        </h3>
                                        <ul className='space-y-2'>
                                            {currentStepData.proTips.map(
                                                (tip, index) => (
                                                    <li
                                                        key={index}
                                                        className='text-green-700 flex items-start gap-2'>
                                                        <span className='text-green-400 mt-1'>
                                                            •
                                                        </span>
                                                        {tip}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Examples */}
                        <div className='grid md:grid-cols-2 gap-6'>
                            <Card className='border-green-200 bg-green-50 transition-all duration-300 hover:shadow-lg'>
                                <CardHeader>
                                    <CardTitle className='text-green-800 flex items-center gap-2'>
                                        <CheckCircle className='w-5 h-5' />
                                        Great Example
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-green-700 text-sm whitespace-pre-line mb-3'>
                                        {currentStepData.examples.good}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className='border-red-200 bg-red-50 transition-all duration-300 hover:shadow-lg'>
                                <CardHeader>
                                    <CardTitle className='text-red-800 flex items-center gap-2'>
                                        <span className='text-red-500'>✗</span>
                                        Weak Example
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-red-700 text-sm whitespace-pre-line mb-3'>
                                        {currentStepData.examples.bad}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reasoning */}
                        <Card className='transition-all duration-300 hover:shadow-lg'>
                            <CardContent className='p-6'>
                                <h3 className='font-semibold mb-2'>
                                    Why the difference?
                                </h3>
                                <p className='text-gray-700'>
                                    {currentStepData.examples.reasoning}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Checklist */}
                        <Card className='transition-all duration-300 hover:shadow-lg'>
                            <CardHeader>
                                <CardTitle className='flex items-center justify-between'>
                                    <span>Checklist Items</span>
                                    <Badge
                                        variant='secondary'
                                        className='transition-all duration-300'>
                                        Score: {calculateStepScore(currentStep)}
                                        %
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    {currentStepData.checklist.map((item) => (
                                        <div
                                            key={item.id}
                                            className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200'>
                                            <Checkbox
                                                id={item.id}
                                                checked={item.checked}
                                                onCheckedChange={(checked) =>
                                                    updateChecklistItem(
                                                        currentStep,
                                                        item.id,
                                                        checked as boolean
                                                    )
                                                }
                                                className='data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 transition-all duration-200'
                                            />
                                            <label
                                                htmlFor={item.id}
                                                className={`text-sm font-medium cursor-pointer transition-all duration-200 ${
                                                    item.checked
                                                        ? "line-through text-gray-500"
                                                        : "text-gray-900"
                                                }`}>
                                                {item.text}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Navigation */}
                    <div className='flex justify-between items-center mt-8'>
                        <Button
                            variant='outline'
                            onClick={() => {
                                if (currentStep === 0) {
                                    router.push("/")
                                } else {
                                    setCurrentStep(Math.max(0, currentStep - 1))
                                }
                            }}
                            className='flex items-center gap-2 transition-all duration-300 hover:scale-105'>
                            <ArrowLeft className='w-4 h-4' />
                            {currentStep === 0 ? "Exit" : "Previous"}
                        </Button>

                        {isLastStep ? (
                            <Button
                                onClick={() => setShowResult(true)}
                                className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 transition-all duration-300 hover:scale-105'>
                                Show Result
                                <Sparkles className='w-4 h-4' />
                            </Button>
                        ) : (
                            <Button
                                onClick={() =>
                                    setCurrentStep(
                                        Math.min(
                                            builder.stepData.length - 1,
                                            currentStep + 1
                                        )
                                    )
                                }
                                className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 transition-all duration-300 hover:scale-105'>
                                Next
                                <ArrowRight className='w-4 h-4' />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
