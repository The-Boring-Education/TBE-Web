import React, { useState, useEffect } from 'react';
import { OnboardingFieldConfig, User } from '../types/onboarding';
import { checkUsernameAvailable } from '../utils/api';

interface OnboardingFormProps {
  config: any;
  form: Record<string, unknown>;
  setForm: (form: any) => void;
  step: number;
  productId: string;
  token?: string;
  user?: User;
  onUsernameAvailabilityChange?: (available: boolean, checking: boolean) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({
  config,
  form,
  setForm,
  step,
  token,
  user,
  onUsernameAvailabilityChange,
}) => {
  const [fieldFocus, setFieldFocus] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const currentFields: OnboardingFieldConfig[] = config.fields.filter((f: OnboardingFieldConfig) => f.step === step);

  // Username availability check
  useEffect(() => {
    const field = config.fields.find(
      (f: OnboardingFieldConfig) => f.checkAvailability
    );
    if (field && form[field.name] && form[field.name] !== user?.userName) {
      setUsernameChecking(true);
      const timeout = setTimeout(async () => {
        const available = await checkUsernameAvailable(form[field.name] as string, token);
        setUsernameAvailable(available);
        setUsernameChecking(false);
      }, 1200);
      return () => clearTimeout(timeout);
    } else {
      setUsernameChecking(false);
    }
  }, [form, config.fields, token, user]);

  // Notify parent component of username availability changes
  useEffect(() => {
    if (onUsernameAvailabilityChange) {
      onUsernameAvailabilityChange(usernameAvailable, usernameChecking);
    }
  }, [usernameAvailable, usernameChecking, onUsernameAvailabilityChange]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: Record<string, unknown>) => {
        const arr = Array.isArray(prev[name]) ? prev[name] : [];
        if (checked) {
          return { ...prev, [name]: [...(arr as string[]), value] };
        } else {
          return { ...prev, [name]: (arr as string[]).filter((v: string) => v !== value) };
        }
      });
    } else {
      setForm((prev: Record<string, unknown>) => ({ ...prev, [name]: value }));
    }
  };

  const handleButtonClick = (fieldName: string, value: string) => {
    setForm((prev: Record<string, unknown>) => {
      const currentValues = Array.isArray(prev[fieldName])
        ? (prev[fieldName] as string[])
        : [];
      const isSelected = currentValues.includes(value);
      if (isSelected) {
        return {
          ...prev,
          [fieldName]: currentValues.filter((v: string) => v !== value),
        };
      } else {
        return { ...prev, [fieldName]: [...currentValues, value] };
      }
    });
  };

  const renderField = (field: OnboardingFieldConfig) => {
    const val = form[field.name] || (field.type === 'multiselect' ? [] : '');
    const fieldClasses = `w-full border rounded-lg px-4 py-2.5 focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-red-300/20 text-base ${
      fieldFocus
        ? 'border-red-400 shadow bg-white/80'
        : 'border-gray-200 bg-white/60 hover:bg-white/80'
    }`;

    switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <div className='relative'>
          <input
            type={field.type}
            name={field.name}
            value={val as string}
            onChange={handleChange}
            onFocus={() => setFieldFocus(true)}
            onBlur={() => setFieldFocus(false)}
            placeholder={field.placeholder}
            className={fieldClasses}
            autoComplete='off'
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-4'>
            <div className='w-2 h-2 bg-red-500 rounded-full opacity-60'></div>
          </div>
        </div>
      );

    case 'select':
      return (
        <div className='flex flex-wrap gap-3 justify-center'>
          {field.options?.map(opt => {
            const isSelected = val === opt;
            return (
              <button
                key={opt}
                type='button'
                onClick={() =>
                  setForm((prev: Record<string, unknown>) => ({ ...prev, [field.name]: opt }))
                }
                className={`px-4 py-1.5 rounded-md font-medium transition-all duration-300 border text-sm shadow focus:outline-none focus:ring-1 focus:ring-red-300/30 ${
                  isSelected
                    ? 'bg-red-400 text-white border-red-400 hover:bg-red-500 hover:border-red-500'
                    : 'bg-white text-red-400 border-red-400 hover:bg-red-50 hover:border-red-500'
                }`}
                style={{ minWidth: '80px' }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );

    case 'multiselect':
      return (
        <div className='flex flex-wrap gap-3 justify-center'>
          {field.options?.map(opt => {
            const isSelected = (val as string[]).includes(opt);
            return (
              <button
                key={opt}
                type='button'
                onClick={() => handleButtonClick(field.name, opt)}
                className={`px-4 py-1.5 rounded-md font-medium transition-all duration-300 border text-sm shadow focus:outline-none focus:ring-1 focus:ring-red-300/30 ${
                  isSelected
                    ? 'bg-red-400 text-white border-red-400 hover:bg-red-500 hover:border-red-500'
                    : 'bg-white text-red-400 border-red-400 hover:bg-red-50 hover:border-red-500'
                }`}
                style={{ minWidth: '80px' }}
              >
                <div className='flex items-center space-x-2'>
                  {isSelected && (
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      );

    case 'tel':
      return (
        <div className='relative'>
          <input
            type='tel'
            name={field.name}
            value={val as string}
            onChange={handleChange}
            onFocus={() => setFieldFocus(true)}
            onBlur={() => setFieldFocus(false)}
            placeholder={field.placeholder}
            className={fieldClasses}
            autoComplete='off'
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-4'>
            <svg className='w-5 h-5 text-red-400' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
            </svg>
          </div>
        </div>
      );

    default:
      return null;
    }
  };

  return (
    <div className='space-y-5'>
      <div className='text-center mb-6'>
        {/* If only one field, show label/placeholder as before. If multiple, show a group label. */}
        {currentFields.length === 1 ? (
          <>
            <h2 className='text-xl font-semibold text-gray-800 mb-1'>
              {currentFields[0].label}
              {currentFields[0].required && <span className='text-red-400 ml-1'>*</span>}
            </h2>
            {currentFields[0].placeholder && (
              <p className='text-gray-500 text-base'>{currentFields[0].placeholder}</p>
            )}
          </>
        ) : (
          <>
            <h2 className='text-xl font-semibold text-gray-800 mb-1'>
              Social Profiles (optional)
            </h2>
            <p className='text-gray-500 text-base'>You can provide any or all of your social profiles below.</p>
          </>
        )}
      </div>

      {/* Render all fields for this step */}
      {currentFields.map(field => (
        <div key={field.name}>{renderField(field)}
          {/* Username availability logic, if needed */}
          {field.checkAvailability && Boolean(form[field.name]) && (
            <>
              {usernameChecking && (
                <div className='mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 text-sm font-normal'>
                  <div className='flex items-center space-x-2'>
                    <svg className='animate-spin w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>Checking username availability...</span>
                  </div>
                </div>
              )}
              {!usernameChecking && !usernameAvailable && (
                <div className='mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-500 text-sm font-normal'>
                  <div className='flex items-center space-x-2'>
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>Username not available</span>
                  </div>
                </div>
              )}
              {!usernameChecking && usernameAvailable && (
                <div className='mt-2 p-2 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm font-normal'>
                  <div className='flex items-center space-x-2'>
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span>Username is available!</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default OnboardingForm;
