import React, { useState } from 'react';

interface OnboardingData {
  userId: string;
  name: string;
  username: string;
  experienceLevel: string;
  linkedInUrl?: string;
  goal: '3Months' | '6Months' | '1Year';
  targetCompanies: ('Startup' | 'MidSize' | 'MNC' | 'FAANG')[];
  preferredCategories: (
    | 'MNC'
    | 'MERN'
    | 'CollegePlacement'
    | 'DSA'
    | 'SystemDesign'
    | 'GeneralTech'
  )[];
}

interface EnhancedOnboardingProps {
  userId: string;
  onComplete: (data: OnboardingData) => void;
}

const EnhancedOnboarding: React.FC<EnhancedOnboardingProps> = ({
  userId,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    userId,
    name: '',
    username: '',
    experienceLevel: '',
    linkedInUrl: '',
    goal: '6Months',
    targetCompanies: [],
    preferredCategories: [],
  });

  const experienceLevels = [
    { value: 'fresher', label: '0-1 years (Fresher)', icon: '🌱' },
    { value: 'junior', label: '1-3 years (Junior)', icon: '💼' },
    { value: 'mid', label: '3-5 years (Mid-level)', icon: '🚀' },
    { value: 'senior', label: '5+ years (Senior)', icon: '👔' },
  ];

  const goals = [
    {
      value: '3Months' as const,
      label: '3 Months',
      description: 'Quick interview preparation',
      icon: '⚡',
    },
    {
      value: '6Months' as const,
      label: '6 Months',
      description: 'Comprehensive preparation',
      icon: '🎯',
      popular: true,
    },
    {
      value: '1Year' as const,
      label: '1 Year',
      description: 'Long-term career planning',
      icon: '🌟',
    },
  ];

  const companyTypes = [
    {
      value: 'Startup' as const,
      label: 'Startups',
      icon: '🚀',
      description: 'Fast-paced, innovative companies',
    },
    {
      value: 'MidSize' as const,
      label: 'Mid-size Companies',
      icon: '🏢',
      description: 'Established growing companies',
    },
    {
      value: 'MNC' as const,
      label: 'MNCs',
      icon: '🌍',
      description: 'Large multinational corporations',
    },
    {
      value: 'FAANG' as const,
      label: 'FAANG',
      icon: '⭐',
      description: 'Top tech giants (Meta, Apple, Amazon, Netflix, Google)',
    },
  ];

  const interviewCategories = [
    {
      value: 'MNC' as const,
      label: 'MNC Interview Prep',
      icon: '🏢',
      description: 'DSA + System Design + Tech',
    },
    {
      value: 'MERN' as const,
      label: 'MERN Stack Prep',
      icon: '⚛️',
      description: 'JS + React + Node + DSA',
    },
    {
      value: 'CollegePlacement' as const,
      label: 'College Placement',
      icon: '🎓',
      description: 'DSA + Aptitude + Basics',
    },
    {
      value: 'DSA' as const,
      label: 'DSA Focus',
      icon: '🧠',
      description: 'Data Structures & Algorithms',
    },
    {
      value: 'SystemDesign' as const,
      label: 'System Design',
      icon: '🏗️',
      description: 'Architecture & Design',
    },
    {
      value: 'GeneralTech' as const,
      label: 'General Tech',
      icon: '💻',
      description: 'General technical questions',
    },
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (
    field: 'targetCompanies' | 'preferredCategories',
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? (prev[field] as any[]).filter((item: any) => item !== value)
        : [...prev[field], value],
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.username.trim();
      case 2:
        return formData.experienceLevel;
      case 3:
        return formData.goal;
      case 4:
        return formData.targetCompanies.length > 0;
      case 5:
        return formData.preferredCategories.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl'>
        {/* Progress Bar */}
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm text-gray-600'>Step {step} of 5</span>
            <span className='text-sm text-gray-600'>
              {Math.round((step / 5) * 100)}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300'
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Welcome to PrepYatra! 👋
              </h2>
              <p className='text-gray-600'>
                Let's start with your basic information
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter your full name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Username *
                </label>
                <input
                  type='text'
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Choose a unique username'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  LinkedIn URL (Optional)
                </label>
                <input
                  type='url'
                  value={formData.linkedInUrl}
                  onChange={(e) =>
                    updateFormData('linkedInUrl', e.target.value)
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='https://linkedin.com/in/yourprofile'
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                What's your experience level? 💼
              </h2>
              <p className='text-gray-600'>
                This helps us personalize your preparation
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateFormData('experienceLevel', level.value)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>{level.icon}</div>
                  <div className='font-medium text-gray-900'>{level.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Goal Timeline */}
        {step === 3 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                What's your goal timeline? 🎯
              </h2>
              <p className='text-gray-600'>
                When are you planning to crack your next job?
              </p>
            </div>

            <div className='space-y-3'>
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => updateFormData('goal', goal.value)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all relative ${
                    formData.goal === goal.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {goal.popular && (
                    <span className='absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full'>
                      Popular
                    </span>
                  )}
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>{goal.icon}</span>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {goal.label}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {goal.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Target Companies */}
        {step === 4 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Which companies interest you? 🏢
              </h2>
              <p className='text-gray-600'>
                Select all that apply - we'll customize questions accordingly
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {companyTypes.map((company) => (
                <button
                  key={company.value}
                  onClick={() =>
                    toggleArrayField('targetCompanies', company.value)
                  }
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    formData.targetCompanies.includes(company.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>{company.icon}</div>
                  <div className='font-medium text-gray-900 mb-1'>
                    {company.label}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {company.description}
                  </div>
                </button>
              ))}
            </div>

            <div className='text-sm text-gray-500 text-center'>
              {formData.targetCompanies.length} selected
            </div>
          </div>
        )}

        {/* Step 5: Interview Categories */}
        {step === 5 && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                What would you like to focus on? 📚
              </h2>
              <p className='text-gray-600'>Choose your preparation areas</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {interviewCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() =>
                    toggleArrayField('preferredCategories', category.value)
                  }
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    formData.preferredCategories.includes(category.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>{category.icon}</div>
                  <div className='font-medium text-gray-900 mb-1'>
                    {category.label}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {category.description}
                  </div>
                </button>
              ))}
            </div>

            <div className='text-sm text-gray-500 text-center'>
              {formData.preferredCategories.length} selected
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className='flex justify-between mt-8'>
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isStepValid()
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 5 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboarding;
