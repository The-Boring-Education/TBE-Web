import {
  FlexContainer,
  OnboardingLayout,
  OnboardingProgressBar,
  SectionHeaderContainer,
  SEO,
  StepNavigation,
  StepOccupation,
  StepPhoneNumber,
  StepUsage,
  StepUsername,
  Toast,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import { useApi, useUser } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps, getRedirectUrl } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';

const steps = [StepUsername, StepOccupation, StepUsage, StepPhoneNumber];

const OnboardingPage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { user, updateSession } = useUser();
  const { makeRequest } = useApi('onboarding');

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    userName: '',
    occupation: '',
    purpose: [] as string[],
    contactNo: '+91',
  });
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.isOnboarded) {
      const redirectTo = getRedirectUrl();
      router.replace(redirectTo);
    }
  }, [user?.isOnboarded, router]);

  const { userName, occupation, purpose, contactNo } = form;

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!user?.id || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = { ...form, isOnboarded: true };

      const { status } = await makeRequest({
        url: `${routes.api.onboard}?userId=${user.id}`,
        method: 'POST',
        body: payload,
      });

      if (status) {
        setToast({
          message: 'Onboarding completed successfully!',
          type: 'success',
        });

        // Update the session to reflect the new onboarding status
        await updateSession();

        // Add a small delay to ensure session is updated
        setTimeout(() => {
          const redirectTo = getRedirectUrl();
          router.push(redirectTo);
        }, 500);
      }
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return userName.length > 2 && isUsernameAvailable;
      case 1:
        return occupation.trim().length > 0;
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
    const updateForm = (key: keyof typeof form, value: any) =>
      setForm((prev) => ({ ...prev, [key]: value }));

    switch (currentStep) {
      case 0:
        return (
          <StepUsername
            setIsUsernameAvailable={setIsUsernameAvailable}
            userName={userName}
            onChange={(val) => updateForm('userName', val)}
          />
        );
      case 1:
        return (
          <StepOccupation
            value={occupation}
            onChange={(val) => updateForm('occupation', val)}
          />
        );
      case 2:
        return (
          <StepUsage
            selected={purpose}
            onChange={(val) => updateForm('purpose', val)}
          />
        );
      case 3: {
        const [code = '+91', number = ''] = contactNo.split(' ');
        return (
          <StepPhoneNumber
            countryCode={code}
            phoneNumber={number}
            onChangeCode={(val) => updateForm('contactNo', `${val} ${number}`)}
            onChangeNumber={(val) => updateForm('contactNo', `${code} ${val}`)}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <OnboardingLayout>
        <FlexContainer className='gap-6' direction='col' fullWidth>
          <FlexContainer className='gap-3' direction='col'>
            <SectionHeaderContainer
              focusText='Your Tech Journey'
              heading="Let's Start "
              headingLevel={4}
              subtext="Let's get to know you better"
            />
            <OnboardingProgressBar
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          </FlexContainer>
          {renderStep()}
          <StepNavigation
            currentStep={currentStep}
            isLastStep={currentStep === steps.length - 1}
            isValid={isValidStep()}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </FlexContainer>
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

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.onboarding })),
});

export default OnboardingPage;
