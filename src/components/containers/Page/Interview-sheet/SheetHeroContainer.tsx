import {
  FlexContainer,
  Text,
  PageHeroMetaContainer,
  LoginWithGoogleButton,
  Button,
  LinkButton,
} from '@/components';
import { routes } from '@/constant';
import { useUser } from '@/hooks';
import useApi from '@/hooks/useApi';
import { SheetHeroContainerProps } from '@/interfaces';

const SheetHeroContainer = ({
  id,
  name,
  isEnrolled,
}: SheetHeroContainerProps) => {
  const { user, isAuth } = useUser();

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
        window.location.reload();
      })
      .catch((error) => {
        console.error('Failed to enroll', error);
      });
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <FlexContainer>
        <LoginWithGoogleButton text='Login to Get Started' />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled) {
    headerActionButton = (
      <FlexContainer>
        <Button
          variant='PRIMARY'
          text='Enroll in Sheet'
          onClick={enrollSheet}
        />
      </FlexContainer>
    );
  }

  if (loading) {
    headerActionButton = (
      <Button variant='PRIMARY' text='Enrolling...' isLoading={true} />
    );
  }

  return (
    <FlexContainer>
      <FlexContainer className='border md:w-4/5 gap-4 w-full p-2 justify-between rounded'>
        {/* Back Button */}
        <LinkButton
          href={routes.user.sheets}
          buttonProps={{
            variant: 'GHOST',
            text: 'Back',
          }}
        />

        {/* Heading and Subheading */}
        <FlexContainer
          itemCenter={false}
          direction='col'
          className='items-start gap-1'
        >
          <Text level='h4' className='heading-4'>
            Hello {user?.name ?? 'there'}!
          </Text>
          <Text level='p' className='paragraph text-greyDark'>
            Ready to prepare for interviews?
          </Text>
        </FlexContainer>

        <FlexContainer
          justifyCenter={false}
          itemCenter={false}
          className='justify-start items-start gap-3'
        >
          <PageHeroMetaContainer subtitle="YOU'RE PRACTICING" title={name} />
        </FlexContainer>

        {headerActionButton}
      </FlexContainer>
    </FlexContainer>
  );
};

export default SheetHeroContainer;
