import { FlexContainer, Text, LoginWithGoogleButton } from '@/components';

const WebinarHeroContainer = () => {
  return (
    <FlexContainer>
      <FlexContainer className='flex-col items-center md:flex-row border md:w-4/5 gap-4 w-full p-2 my-4 justify-between rounded'>
        <FlexContainer direction='col' className='gap-1 md:items-start'>
          <Text level='h4' className='heading-4'>
            Hello there!
          </Text>
          <Text level='p' className='paragraph text-greyDark' textCenter={true}>
            Please Login to generate your Certificate
          </Text>
        </FlexContainer>

        <FlexContainer>
          <LoginWithGoogleButton text='Login to Generate' />
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  );
};

export default WebinarHeroContainer;
