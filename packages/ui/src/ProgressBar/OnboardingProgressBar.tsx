import React from 'react'
import { Text } from '@tbe/ui'

interface OnboardingProgressBarProps {
  step: number
  total: number
  className?: string
}

/**
 * OnboardingProgressBar Component
 * 
 * Specialized progress bar for onboarding flows
 * Shows current step, percentage, and visual progress
 */
export default function OnboardingProgressBar({ 
  step, 
  total, 
  className = "" 
}: OnboardingProgressBarProps) {
  // Calculate progress based on completed steps (step - 1) out of total steps
  const completedSteps = step - 1
  const percent = Math.round((completedSteps / total) * 100)
  
  return (
    <div className={`w-full mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <Text variant="caption" className="font-medium text-gray-700">
          Step {step} of {total}
        </Text>
        <Text variant="caption" className="font-medium text-gray-700">
          {percent}% Complete
        </Text>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < step
          const isCurrent = stepNumber === step
          
          return (
            <div
              key={stepNumber}
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }
              `}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
          )
        })}
      </div>
    </div>
  )
}
