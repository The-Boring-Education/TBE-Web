import { useAnalytics, useUser } from '@/hooks';
import { useApi } from '@/hooks';

import {
  Button,
  FlexContainer,
  LinkButton,
  LoginRedirectButton,
  PageHeroMetaContainer,
  Text,
} from '@/components';

import { routes } from '@/constant';
import type { SheetHeroContainerProps } from '@/interfaces';

const SheetHeroContainer = ({
  id,
  name,
  isEnrolled,
}: SheetHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();

  const { makeRequest, loading } = useApi('interview-prep/enrollSheet');

  const enrollSheet = () => {
    makeRequest({
      method: 'POST',
      url: routes.api.enrollSheet,
      body: {
        userId: user?.id,
        sheetId: id,
      },
    })
      .then(() => {
        trackEvent({
          action: 'INTERVIEW_SHEET_ENROLL',
          category: 'InterviewSheet',
          label: 'Interview Sheet Enrolled',
          value: {
            userId: user?.id,
            sheetId: id,
          },
        });

        window.location.reload();
      })
      .catch((error) => {
        return error;
      });
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <FlexContainer>
        <LoginRedirectButton text='Login to Get Started' />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled) {
    headerActionButton = (
      <FlexContainer>
        <Button
          text='Enroll in Sheet'
          variant='PRIMARY'
          onClick={enrollSheet}
        />
      </FlexContainer>
    );
  }

  if (loading) {
    headerActionButton = (
      <Button isLoading={true} text='Enrolling...' variant='PRIMARY' />
    );
  }

  return (
    <FlexContainer>
      <FlexContainer className='border md:w-4/5 gap-4 w-full p-2 justify-between rounded'>
        {/* Back Button */}
        <LinkButton
          buttonProps={{
            variant: 'GHOST',
            text: 'Back',
          }}
          href={routes.user.sheets}
        />

        {/* Heading and Subheading */}
        <FlexContainer
          className='items-start gap-1'
          direction='col'
          itemCenter={false}
        >
          <Text className='heading-4' level='h4'>
            Hello {user?.name ?? 'there'}!
          </Text>
          <Text className='paragraph text-greyDark' level='p'>
            Ready to prepare for interviews?
          </Text>
        </FlexContainer>

        <FlexContainer
          className='justify-start items-start gap-3'
          itemCenter={false}
          justifyCenter={false}
        >
          <PageHeroMetaContainer subtitle="YOU'RE PRACTICING" title={name} />
        </FlexContainer>

        {headerActionButton}
      </FlexContainer>
    </FlexContainer>
  );
};

export default SheetHeroContainer;
