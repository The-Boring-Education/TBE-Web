import React from "react";

import {COMPANY_TYPES} from "@/constants/onboarding";
import type {CompanyType,OnboardingData} from "@/types/onboarding";

type Props = {
    formData: OnboardingData
    toggleArrayField: (field: "targetCompanies", value: CompanyType) => void
}

const StepCompanies: React.FC<Props> = ({formData, toggleArrayField}) => (
    <div className='space-y-6'>
        <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-white mb-2'>
                Which companies interest you? 🏢
            </h1>
            <p className='text-gray'>
                Select all that apply - we'll customize questions accordingly
            </p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {COMPANY_TYPES.map((company) => (
                <button
                    key={company.value}
                    type='button'
                    onClick={() =>
                        toggleArrayField("targetCompanies", company.value)
                    }
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.targetCompanies.includes(company.value)
                            ? "border-primary bg-primary/20"
                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                    }`}>
                    <div className='text-2xl mb-2'>{company.icon}</div>
                    <div className='font-medium text-white mb-1'>
                        {company.label}
                    </div>
                    <div className='text-sm text-gray'>
                        {company.description}
                    </div>
                </button>
            ))}
        </div>
        <div className='text-sm text-gray-400 text-center'>
            {formData.targetCompanies.length} selected
        </div>
    </div>
);

export default StepCompanies;
