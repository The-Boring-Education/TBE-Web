import {BrowserRouter as Router} from 'react-router-dom';
import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, User, Phone, Shield } from 'lucide-react';

type Step = {
  id: number;
  title: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  { id: 1, title: 'Personal Info', icon: <User className="w-5 h-5" /> },
  { id: 2, title: 'Contact', icon: <Phone className="w-5 h-5" /> },
  { id: 3, title: 'Preferences', icon: <Shield className="w-5 h-5" /> },
];

const countryCodes = ['+1', '+44', '+81', '+86', '+91'];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    countryCode: '+1',
    phone: '',
    accountType: 'personal',
    notifications: {
      email: false,
      sms: false,
      push: false,
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateUsername = (username: string) => {
    if (username.length < 7) {
      return 'Username must be at least 7 characters';
    }
    if (!username.includes('@') || !username.includes('_')) {
      return 'Username must contain both @ and _ symbols';
    }
    if (!/^[a-zA-Z0-9@_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, @, and _';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!/^\d{10}$/.test(phone)) {
      return 'Phone number must be 10 digits';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validate on change
      if (name === 'username') {
        const error = validateUsername(value);
        setErrors(prev => ({ ...prev, username: error }));
      }
      if (name === 'phone') {
        const error = validatePhone(value);
        setErrors(prev => ({ ...prev, phone: error }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.username) {
      const usernameError = validateUsername(formData.username);
      if (usernameError) {
        setErrors(prev => ({ ...prev, username: usernameError }));
        return;
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="accountType"
                    value="personal"
                    checked={formData.accountType === 'personal'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Personal Account</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="accountType"
                    value="business"
                    checked={formData.accountType === 'business'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Business Account</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex space-x-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {countryCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`flex-1 px-3 py-2 border rounded-md ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="email"
                  checked={formData.notifications.email}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span>Email Notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="sms"
                  checked={formData.notifications.sms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span>SMS Notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="push"
                  checked={formData.notifications.push}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span>Push Notifications</span>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex justify-between mb-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.id <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  }`}>
                    {step.id < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="hidden sm:block ml-2 text-sm font-medium">
                    {step.title}
                  </div>
                </div>
              ))}
              <div
                className="absolute top-4 h-0.5 bg-gray-200 w-full -z-10"
                style={{ transform: 'translateY(-50%)' }}
              />
              <div
                className="absolute top-4 h-0.5 bg-blue-600 -z-10"
                style={{
                  transform: 'translateY(-50%)',
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="py-4">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-md ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length}
              className={`flex items-center px-4 py-2 rounded-md ${
                currentStep === steps.length
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;