import React from "react";

import {INTERVIEW_CATEGORIES} from "@tbe/constants";
import type {OnboardingData, InterviewCategory} from "@tbe/types";

type Props = {
    formData: OnboardingData
    toggleArrayField: (
        field: "preferredCategories",
        value: InterviewCategory
    ) => void
}

const StepCategories: React.FC<Props> = ({formData, toggleArrayField}) => (
    <div className='space-y-6'>
        <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-white mb-2'>
                What would you like to focus on? 📚
            </h1>
            <p className='text-gray'>Choose your preparation areas</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {INTERVIEW_CATEGORIES.map((category) => (
                <button
                    key={category.value}
                    type='button'
                    onClick={() =>
                        toggleArrayField("preferredCategories", category.value)
                    }
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.preferredCategories.includes(category.value)
                            ? "border-primary bg-primary/20"
                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                    }`}>
                    <div className='text-2xl mb-2'>{category.icon}</div>
                    <div className='font-medium text-white mb-1'>
                        {category.label}
                    </div>
                    <div className='text-sm text-gray'>
                        {category.description}
                    </div>
                </button>
            ))}
        </div>
        <div className='text-sm text-gray-400 text-center'>
            {formData.preferredCategories.length} selected
        </div>
    </div>
);

export default StepCategories;
