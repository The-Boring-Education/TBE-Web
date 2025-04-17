import { Fragment, useState } from 'react';
import {
  OnboardingLayout,
  StepUsername,
  StepOccupation,
  StepUsage,
  StepPhoneNumber,
  OnboardingProgressBar,
  StepNavigation,
  Toast,
  SEO,
} from '@/components';
import { useApi, useUser } from '@/hooks';
import { routes } from '@/constant';
import { getPreFetchProps } from '@/utils';
import { PageProps } from '@/interfaces';
import { useRouter } from 'next/router';

const steps = [StepUsername, StepOccupation, StepUsage, StepPhoneNumber];

const OnboardingPage = ({ seoMeta }: PageProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    userName: '',
    profession: '',
    purpose: [] as string[],
    contactNo: '+91',
  });
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const { user } = useUser();
  const router = useRouter();
  const { makeRequest } = useApi('onboarding');
  const { userName, profession, purpose, contactNo } = formData;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      const payload = {
        userName: formData.userName,
        isOnboarded: true,
        profession: formData.profession,
        purpose: formData.purpose,
        contactNo: formData.contactNo,
      };

      await makeRequest({
        url: `${routes.api.onboard}?userId=${user.id}`,
        method: 'POST',
        body: payload,
      });

      setToast({
        message: 'Onboarding completed successfully!',
        type: 'success',
      });

      // redirect to ?redirectTo=
      const redirectTo = new URL(window.location.href).searchParams.get(
        'redirectTo'
      );
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(routes.user.dashboard);
      }
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return userName.length > 2 && isUsernameAvailable === true;
      case 1:
        return profession !== '';
      case 2:
        return purpose.length > 0;
      case 3: {
        const [code, number] = contactNo.split(' ');
        return (
          code.startsWith('+') && number?.replace(/[^0-9]/g, '').length >= 10
        );
      }
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepUsername
            userName={userName}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, userName: value }))
            }
            setIsAvailable={setIsUsernameAvailable}
          />
        );
      case 1:
        return (
          <StepOccupation
            value={profession}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, profession: value }))
            }
          />
        );
      case 2:
        return (
          <StepUsage
            selected={purpose}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, purpose: value }))
            }
          />
        );
      case 3:
        return (
          <StepPhoneNumber
            countryCode={contactNo.split(' ')[0]}
            phoneNumber={contactNo.split(' ')[1] || ''}
            onChangeCode={(code) =>
              setFormData((prev) => ({
                ...prev,
                contactNo: `${code} ${prev.contactNo.split(' ')[1] || ''}`,
              }))
            }
            onChangeNumber={(number) =>
              setFormData((prev) => ({
                ...prev,
                contactNo: `${prev.contactNo.split(' ')[0]} ${number}`,
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={handleBack}
      >
        <OnboardingProgressBar
          currentStep={currentStep}
          totalSteps={steps.length}
        />
        {renderStep()}
        <StepNavigation
          currentStep={currentStep}
          isValid={isStepValid()}
          isLastStep={currentStep === steps.length - 1}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </OnboardingLayout>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default OnboardingPage;
