import React from "react";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {OnboardingData} from "@/types/onboarding";

type Props = {
    formData: OnboardingData
    handleInputChange: (field: keyof OnboardingData, value: string) => void
}

const StepProfile: React.FC<Props> = ({formData, handleInputChange}) => (
    <div className='space-y-6'>
        <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-white mb-2'>
                Complete Your Profile
            </h1>
            <p className='text-gray'>Let's get you set up for success!</p>
        </div>
        {/* LinkedIn Url */}
        <div>
            <Label htmlFor='linkedInUrl' className='text-white font-medium'>
                LinkedIn Url
            </Label>
            <Input
                id='linkedInUrl'
                type='url'
                placeholder='https://www.linkedin.com/in/your-profile'
                value={formData.linkedInUrl}
                onChange={(e) =>
                    handleInputChange("linkedInUrl", e.target.value)
                }
                className='mt-2 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400'
            />
        </div>

        {/* Work Domain */}
        <div>
            <Label className='text-white font-medium mb-4 block'>
                Work Domain *
            </Label>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3'>
                {[
                    "MERN Full-stack",
                    "Java Full-stack",
                    "Python Full-stack",
                    "Data Analysis",
                    "Machine Learning",
                    "AI",
                    "App Development",
                    "Others"
                ].map((domain) => (
                    <button
                        type='button'
                        key={domain}
                        onClick={() => handleInputChange("workDomain", domain)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            formData.workDomain === domain
                                ? "bg-primary text-white border-primary"
                                : "bg-transparent text-gray border-gray-600 hover:bg-gray-700"
                        }`}>
                        {domain}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default StepProfile;
