import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  FlexContainer,
  SEO,
  Section,
  Text,
  Button,
  InputFieldContainer,
  RadioButton,
  Toast,
  OutlineCard,
  Checkbox,
} from '@/components';
import { COUNTRY_CODES } from '@/constant/countryCode';
import { PageProps } from '@/interfaces';
import { useUser, useApi } from '@/hooks';
import { getPreFetchProps } from '@/utils';
import { routes } from '@/constant';
import { motion } from 'framer-motion';

// Profession options for the form
const PROFESSION_OPTIONS = [
  'Student',
  'Working Professional',
  'Freelancer',
  'Other',
];

// Platform usage options for the form
const PLATFORM_USAGE_OPTIONS = [
  'Learning to code',
  'Improving skills',
  'Preparing for interviews',
  'Building projects',
  'Exploring tech careers',
];

const Onboarding = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { user, isAuth, loading: loadingUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    profession: '',
    platformUsage: [] as string[],
    contactNumber: '',
    countryCode: '+91', // Default country code
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { redirectTo } = router.query;

  // API hooks for username validation and onboarding submission
  const { makeRequest: validateUsername, loading: validatingUsername } = useApi('validate-username');
  const { makeRequest: submitOnboarding, loading: submittingOnboarding } = useApi('submit-onboarding');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loadingUser && !isAuth) {
      router.push(routes.register);
    }
  }, [loadingUser, isAuth, router]);

  // Handle username validation with throttling
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.username && formData.username.length >= 3) {
        setIsCheckingUsername(true);
        try {
          // This would be replaced with an actual API call when implemented
          const response = await validateUsername({
            method: 'POST',
            url: `${routes.api.base}/user/validate-username`,
            body: { username: formData.username },
          });

          setUsernameAvailable(response?.status);
          if (!response?.status) {
            setErrorMessage('Username is already taken');
          } else {
            setErrorMessage(null);
          }
        } catch (error) {
          setErrorMessage('Error checking username availability');
        } finally {
          setIsCheckingUsername(false);
        }
      }
    }, 500); // 500ms throttle

    return () => clearTimeout(timer);
  }, [formData.username, validateUsername]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrorMessage(null);

    // Reset username availability check when username changes
    if (field === 'username') {
      setUsernameAvailable(null);
    }
  };

  // Handle next step
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1 && (!formData.username || formData.username.length < 3)) {
      setErrorMessage('Please enter a valid username (at least 3 characters)');
      return;
    }

    if (currentStep === 1 && !usernameAvailable && formData.username.length >= 3) {
      setErrorMessage('Please choose a different username');
      return;
    }

    if (currentStep === 2 && !formData.profession) {
      setErrorMessage('Please select your profession');
      return;
    }

    if (currentStep === 3 && formData.platformUsage.length === 0) {
      setErrorMessage('Please select at least one option for how you plan to use the platform');
      return;
    }

    if (currentStep === 4 && !formData.contactNumber) {
      setErrorMessage('Please enter your contact number');
      return;
    }

    // Move to next step or submit
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setErrorMessage(null);
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrorMessage(null);
    }
  };

  // Handle platform usage selection
  const handlePlatformUsageChange = (option: string) => {
    setFormData(prev => {
      const newUsage = prev.platformUsage.includes(option)
        ? prev.platformUsage.filter(item => item !== option)
        : [...prev.platformUsage, option];
      return { ...prev, platformUsage: newUsage };
    });
    setErrorMessage(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // This would be replaced with an actual API call when implemented
      const response = await submitOnboarding({
        method: 'POST',
        url: `${routes.api.base}/user/onboarding`,
        body: formData,
      });

      if (response?.status) {
        setSuccessMessage('Onboarding completed successfully!');
        setTimeout(() => {
          // Redirect to the original destination or dashboard
          if (redirectTo && typeof redirectTo === 'string') {
            router.push(decodeURIComponent(redirectTo));
          } else {
            router.push(routes.user.dashboard);
          }
        }, 2000);
      } else {
        setErrorMessage(response?.message || 'Failed to complete onboarding');
      }
    } catch (error) {
      setErrorMessage('Failed to complete onboarding. Please try again later.');
    }
  };

  if (loadingUser) return null;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer className='min-h-[80vh] items-center justify-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-2xl'
          >
            <FlexContainer
              direction='col'
              className='gap-6 px-6 py-8 md:px-10 md:py-10 border rounded-xl shadow-lg bg-gradient-to-br from-card to-card/50'
            >
              {/* Header */}
              <FlexContainer direction='col' className='gap-2 text-center'>
                <Text level='h2' className='text-2xl md:text-3xl font-bold'>
                  Welcome to The Boring Education
                </Text>
                <Text level='p' className='text-muted-foreground'>
                  Let's set up your profile to get started
                </Text>
                {/* Progress indicator */}
                <FlexContainer className='w-full mt-4 gap-2 justify-center'>
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full ${step <= currentStep ? 'bg-primary' : 'bg-gray-200'} ${step === currentStep ? 'w-8' : 'w-6'} transition-all`}
                    />
                  ))}
                </FlexContainer>
              </FlexContainer>

              <FlexContainer direction="col" className="gap-6">
                {/* Step 1: Username */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <InputFieldContainer
                      label="Choose Your Username"
                      type="text"
                      value={formData.username}
                      onChange={(value) => handleInputChange('username', value)}
                      placeholder="Enter a unique username"
                      isLoading={validatingUsername}
                      success={usernameAvailable}
                      error={!usernameAvailable && formData.username.length >= 3}
                    />
                  </motion.div>
                )}

                {/* Step 2: Profession */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {PROFESSION_OPTIONS.map((option) => (
                      <RadioButton
                        key={option}
                        label={option}
                        checked={formData.profession === option}
                        onChange={() => handleInputChange('profession', option)}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Step 3: Platform Usage */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {PLATFORM_USAGE_OPTIONS.map((option) => (
                      <Checkbox
                        key={option}
                        label={option}
                        checked={formData.platformUsage.includes(option)}
                        onChange={() => handlePlatformUsageChange(option)}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Step 4: Contact Information */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <FlexContainer className="gap-4">
                      <select
                        value={formData.countryCode}
                        onChange={(e) =>
                          handleInputChange('countryCode', e.target.value)
                        }
                        className="w-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {COUNTRY_CODES.map(({ code, country }) => (
                          <option key={code} value={code}>
                            {country} ({code})
                          </option>
                        ))}
                      </select>
                      <InputFieldContainer
                        label="Contact Number"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(value) =>
                          handleInputChange('contactNumber', value)
                        }
                        placeholder="Enter your contact number"
                      />
                    </FlexContainer>
                  </motion.div>
                )}
              </FlexContainer>

              {/* Navigation Buttons */}
              <FlexContainer className='justify-between mt-4'>
                <Button
                  variant='OUTLINE'
                  text='Back'
                  onClick={handlePrevStep}
                  active={currentStep > 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                />
                <Button
                  variant='PRIMARY'
                  text={currentStep === 4 ? 'Complete' : 'Next'}
                  onClick={handleNextStep}
                  active={true}
                  isLoading={currentStep === 4 ? submittingOnboarding : currentStep === 1 ? validatingUsername : false}
                />
              </FlexContainer>

              {/* Error/Success Messages */}
              {errorMessage && <Toast message={errorMessage} type='error' />}
              {successMessage && <Toast message={successMessage} type='success' />}
            </FlexContainer>
          </motion.div>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;
export default Onboarding;