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
  SectionHeaderContainer,
} from '@/components';
import { useApi, useUser } from '@/hooks';
import { routes } from '@/constant';
import { getPreFetchProps, getRedirectUrl } from '@/utils';
import { PageProps } from '@/interfaces';
import { useRouter } from 'next/router';
import FlexContainer from '@/components/containers/Page/common/FlexContainer';

const steps = [StepUsername, StepOccupation, StepUsage, StepPhoneNumber];

const OnboardingPage = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { user } = useUser();
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

  const { userName, occupation, purpose, contactNo } = form;

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!user?.id) return;

    try {
      const payload = { ...form, isOnboarded: true };

      await makeRequest({
        url: `${routes.api.onboard}?userId=${user.id}`,
        method: 'POST',
        body: payload,
      });

      setToast({
        message: 'Onboarding completed successfully!',
        type: 'success',
      });

      const redirectTo = getRedirectUrl();
      router.push(redirectTo);
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      });
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
            userName={userName}
            onChange={(val) => updateForm('userName', val)}
            setIsUsernameAvailable={setIsUsernameAvailable}
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
        <FlexContainer className='gap-6' fullWidth={true} direction='col'>
          <FlexContainer className='gap-3' direction='col'>
            <SectionHeaderContainer
              heading="Let's Start "
              focusText='Your Tech Journey'
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
            isValid={isValidStep()}
            isLastStep={currentStep === steps.length - 1}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
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

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.onboarding })),
    revalidate: 60,
  };
};

export default OnboardingPage;
