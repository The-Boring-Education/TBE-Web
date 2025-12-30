import {
  Button,
  FlexContainer,
  LinkButton,
  LoginRedirectButton,
  PageHeroMetaContainer,
  Text,
} from '@tbe/components';
import { useGamifiedAction } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useAnalytics, useApi, useUser } from '@tbe/hooks';
import type { SheetHeroContainerProps } from '@tbe/interface';

const SheetHeroContainer = ({
  id,
  name,
  isEnrolled,
  isPremium,
  isPurchased,
  redirectTo,
  theme,
}: SheetHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

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
      .then(async () => {
        trackEvent({
          action: 'INTERVIEW_SHEET_ENROLL',
          category: 'InterviewSheet',
          label: 'Interview Sheet Enrolled',
          value: {
            userId: user?.id,
            sheetId: id,
          },
        });

        await gamifiedAction.triggerGamifiedAction({
          gamificationAction: 'ENROLL_SHEET',
          analytics: {
            action: 'INTERVIEW_SHEET_ENROLL',
            category: 'InterviewSheet',
            label: 'Interview Sheet Enrolled',
          },
          customMessage: 'Interview sheet enrolled! Time to practice!',
          metadata: {
            sheetId: id,
            sheetName: name,
          },
        });

        setTimeout(() => {
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            window.location.reload();
          }
        }, 1500);
      })
      .catch((error) => error);
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <FlexContainer>
        <LoginRedirectButton text='Login to Get Started' />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled && !isPremium) {
    headerActionButton = (
      <FlexContainer>
        <Button
          text='Enroll in Sheet'
          variant='PRIMARY'
          onClick={enrollSheet}
        />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled && isPremium && isPurchased) {
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
      <Button isLoading text='Enrolling...' variant='PRIMARY' />
    );
  }

  const isDark = theme === 'dark';

  return (
    <FlexContainer>
      <FlexContainer className={`border md:w-4/5 gap-4 w-full p-2 justify-between rounded ${isDark ? 'border-gray-700 bg-[#0A0A0A]' : 'border-gray-200 bg-white'}`}>
        {/* Back Button */}
        <LinkButton
          buttonProps={{
            variant: 'GHOST',
            text: 'Back',
          }}
          href={routes.home}
          theme={theme}
        />

        {/* Heading and Subheading */}
        <FlexContainer
          className='items-start gap-1'
          direction='col'
          itemCenter={false}
        >
          <Text className={`heading-4 ${isDark ? 'text-white' : 'text-gray-900'}`} level='h4'>
            Hello {user?.name ?? 'there'}!
          </Text>
          <Text className={`paragraph ${isDark ? 'text-gray-400' : 'text-greyDark'}`} level='p'>
            Ready to prepare for interviews?
          </Text>
        </FlexContainer>

        <FlexContainer
          className='justify-start items-start gap-3'
          itemCenter={false}
          justifyCenter={false}
        >
          <PageHeroMetaContainer subtitle="YOU'RE PRACTICING" title={name} theme={theme} />
        </FlexContainer>

        {headerActionButton}
      </FlexContainer>
    </FlexContainer>
  );
};

export default SheetHeroContainer;
