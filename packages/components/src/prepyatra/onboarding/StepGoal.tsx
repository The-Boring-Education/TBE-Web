import React from "react";

import {GOALS} from "@tbe/constants";
import type {OnboardingData,  OnboardingGoalType} from "@tbe/types";

type Props = {
    formData: OnboardingData
    handleInputChange: (field: keyof OnboardingData, value: OnboardingGoalType) => void
}

const StepGoal: React.FC<Props> = ({formData, handleInputChange}) => (
    <div className='space-y-6'>
        <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-white mb-2'>
                What's your goal timeline? 🎯
            </h1>
            <p className='text-gray'>
                When are you planning to crack your next job?
            </p>
        </div>
        <div className='space-y-3'>
            {GOALS.map((goal) => (
                <button
                    key={goal.value}
                    type='button'
                    onClick={() => handleInputChange("goal", goal.value as OnboardingGoalType)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all relative ${
                        formData.goal === goal.value as OnboardingGoalType
                            ? "border-primary bg-primary/20"
                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                    }`}>
                    {goal.popular && (
                        <span className='absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full'>
                            Popular
                        </span>
                    )}
                    <div className='flex items-center space-x-3'>
                        <span className='text-2xl'>{goal.icon}</span>
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
);

export default StepGoal;
