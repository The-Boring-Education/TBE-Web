import React, { useState, useEffect } from 'react'
import { OnboardingField } from '@tbe/ui'

interface OnboardingFieldConfig {
  step: number
  name: string
  label: string
  type: 'text' | 'email' | 'select' | 'textarea' | 'checkbox' | 'url'
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

interface User {
  id: string
  email?: string
  name?: string
}

interface OnboardingFormProps {
  config: {
    fields: OnboardingFieldConfig[]
  }
  form: Record<string, unknown>
  setForm: (form: any) => void
  step: number
  productId: string
  token?: string
  user?: User
  onUsernameAvailabilityChange?: (available: boolean, checking: boolean) => void
  onValidationChange?: (isValid: boolean) => void
}

/**
 * OnboardingForm Component
 * 
 * Refactored to use shared form components and OnboardingField
 * Simplified logic while maintaining all functionality
 */
export default function OnboardingForm({
  config,
  form,
  setForm,
  step,
  token,
  user,
  onUsernameAvailabilityChange,
  onValidationChange
}: OnboardingFormProps) {
  const [fieldValidations, setFieldValidations] = useState<Record<string, boolean>>({})

  // Get fields for current step
  const currentFields = config.fields.filter((field) => field.step === step)

  // Update form data
  const handleFieldChange = (name: string, value: any) => {
    setForm({
      ...form,
      [name]: value
    })
  }

  // Handle field validation
  const handleFieldValidation = (name: string, isValid: boolean) => {
    setFieldValidations(prev => ({
      ...prev,
      [name]: isValid
    }))
  }

  // Check if all current fields are valid
  useEffect(() => {
    const requiredFields = currentFields.filter(field => field.required)
    const allValid = requiredFields.every(field => {
      const hasValue = form[field.name] && form[field.name].toString().trim() !== ''
      const isValidated = fieldValidations[field.name] !== false
      return hasValue && isValidated
    })
    
    onValidationChange?.(allValid)
  }, [currentFields, form, fieldValidations, onValidationChange])

  // Auto-fill user data if available
  useEffect(() => {
    if (user && step === 1) {
      const updates: Record<string, any> = {}
      
      if (user.email && !form.email) {
        updates.email = user.email
      }
      
      if (user.name && !form.name) {
        updates.name = user.name
      }
      
      if (Object.keys(updates).length > 0) {
        setForm({ ...form, ...updates })
      }
    }
  }, [user, step, form, setForm])

  return (
    <div className="space-y-6">
      {currentFields.map((field) => {
        const isUsernameField = field.name === 'username'
        
        return (
          <OnboardingField
            key={field.name}
            field={field}
            value={form[field.name]}
            onChange={handleFieldChange}
            onValidation={handleFieldValidation}
            token={token}
            isUsernameField={isUsernameField}
            onUsernameCheck={onUsernameAvailabilityChange}
          />
        )
      })}
      
      {/* Step-specific help text */}
      {step === 1 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Quick Start:</strong> We'll help you set up your profile to get the most out of your learning journey.
          </p>
        </div>
      )}
      
      {currentFields.some(f => f.name === 'interests') && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            🎯 <strong>Personalization:</strong> Select your interests to receive tailored learning recommendations.
          </p>
        </div>
      )}
    </div>
  )
}