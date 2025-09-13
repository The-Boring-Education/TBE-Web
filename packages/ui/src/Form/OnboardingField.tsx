import React, { useState, useEffect } from 'react'
import { 
  InputFieldContainer, 
  SelectInput, 
  CheckboxButton,
  Text,
  LoadingSpinner 
} from '@tbe/ui'

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

interface OnboardingFieldProps {
  field: OnboardingFieldConfig
  value: any
  onChange: (name: string, value: any) => void
  onValidation?: (name: string, isValid: boolean) => void
  error?: string
  token?: string
  isUsernameField?: boolean
  onUsernameCheck?: (available: boolean, checking: boolean) => void
}

/**
 * OnboardingField Component
 * 
 * Reusable form field component for onboarding flows
 * Uses shared form components with onboarding-specific logic
 */
export default function OnboardingField({
  field,
  value,
  onChange,
  onValidation,
  error,
  token,
  isUsernameField = false,
  onUsernameCheck
}: OnboardingFieldProps) {
  const [focused, setFocused] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  // Username validation for unique fields
  useEffect(() => {
    if (isUsernameField && value && value.length >= 3) {
      const checkUsername = async () => {
        setUsernameChecking(true)
        onUsernameCheck?.(false, true)
        
        try {
          // This would call your API
          // const response = await checkUsernameAvailable(value, token)
          // For now, simulate the check
          await new Promise(resolve => setTimeout(resolve, 500))
          const available = !['admin', 'test', 'user'].includes(value.toLowerCase())
          
          setUsernameAvailable(available)
          onUsernameCheck?.(available, false)
          onValidation?.(field.name, available && !error)
        } catch (err) {
          setUsernameAvailable(false)
          onUsernameCheck?.(false, false)
        } finally {
          setUsernameChecking(false)
        }
      }

      const debounceTimer = setTimeout(checkUsername, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [value, isUsernameField, token, field.name, onUsernameCheck, onValidation, error])

  const handleChange = (newValue: any) => {
    onChange(field.name, newValue)
    
    // Basic validation
    if (onValidation) {
      const isValid = validateField(newValue)
      onValidation(field.name, isValid)
    }
  }

  const validateField = (val: any): boolean => {
    if (field.required && (!val || val.toString().trim() === '')) {
      return false
    }
    
    if (field.validation?.minLength && val.length < field.validation.minLength) {
      return false
    }
    
    if (field.validation?.maxLength && val.length > field.validation.maxLength) {
      return false
    }
    
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern)
      return regex.test(val)
    }
    
    if (isUsernameField && !usernameAvailable) {
      return false
    }
    
    return true
  }

  const getFieldError = (): string | undefined => {
    if (error) return error
    
    if (isUsernameField && value && !usernameAvailable && !usernameChecking) {
      return 'Username is already taken'
    }
    
    return undefined
  }

  const renderField = () => {
    const commonProps = {
      value: value || '',
      onChange: handleChange,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      placeholder: field.placeholder,
      required: field.required,
      error: getFieldError()
    }

    switch (field.type) {
      case 'select':
        return (
          <SelectInput
            {...commonProps}
            options={field.options || []}
          />
        )
      
      case 'checkbox':
        return (
          <CheckboxButton
            checked={value || false}
            onChange={(checked) => handleChange(checked)}
            label={field.label}
          />
        )
      
      case 'textarea':
        return (
          <InputFieldContainer
            {...commonProps}
            type="textarea"
            rows={4}
          />
        )
      
      default:
        return (
          <InputFieldContainer
            {...commonProps}
            type={field.type}
            rightIcon={isUsernameField && usernameChecking ? (
              <LoadingSpinner size="sm" />
            ) : isUsernameField && value && !usernameChecking ? (
              usernameAvailable ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )
            ) : undefined}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <Text variant="label" className="font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Text>
      )}
      
      {renderField()}
      
      {/* Help text for username fields */}
      {isUsernameField && (
        <Text variant="caption" className="text-gray-500">
          Choose a unique username (3+ characters)
        </Text>
      )}
    </div>
  )
}
