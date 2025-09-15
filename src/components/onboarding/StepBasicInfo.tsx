import React from "react";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {OnboardingData} from "@/types/onboarding";

type Props = {
    formData: OnboardingData
    handleInputChange: (field: keyof OnboardingData, value: string) => void
}

const StepBasicInfo: React.FC<Props> = ({formData, handleInputChange}) => (
    <div className='space-y-6'>
        <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-white mb-2'>
                Welcome to PrepYatra! 👋
            </h1>
            <p className='text-gray'>Let's start with your basic information</p>
        </div>
        <div className='space-y-4'>
            <div>
                <Label className='text-white font-medium mb-2 block'>
                    Full Name *
                </Label>
                <Input
                    type='text'
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className='bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400'
                    placeholder='Enter your full name'
                />
            </div>
            <div>
                <Label className='text-white font-medium mb-2 block'>
                    Username *
                </Label>
                <Input
                    type='text'
                    value={formData.username}
                    onChange={(e) =>
                        handleInputChange("username", e.target.value)
                    }
                    className='bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400'
                    placeholder='Choose a unique username'
                />
            </div>
        </div>
    </div>
);

export default StepBasicInfo;
