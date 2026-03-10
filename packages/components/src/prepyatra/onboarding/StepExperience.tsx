import { EXPERIENCE_LEVELS } from "@tbe/constants";
import type { ExperienceLevel, OnboardingData } from "@tbe/types";
import React from "react";

type Props = {
  formData: OnboardingData;
  handleInputChange: (
    field: keyof OnboardingData,
    value: ExperienceLevel,
  ) => void;
};

const StepExperience: React.FC<Props> = ({ formData, handleInputChange }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-white mb-2">
        What's your experience level? 💼
      </h1>
      <p className="text-gray">This helps us personalize your preparation</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {EXPERIENCE_LEVELS.map((level) => (
        <button
          key={level.value}
          type="button"
          onClick={() => handleInputChange("experienceLevel", level.value)}
          className={`p-4 border-2 rounded-xl text-left transition-all ${
            formData.experienceLevel === level.value
              ? "border-primary bg-primary/20"
              : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
          }`}
        >
          <div className="text-2xl mb-2">{level.icon}</div>
          <div className="font-medium text-white">{level.label}</div>
        </button>
      ))}
    </div>
  </div>
);

export default StepExperience;
