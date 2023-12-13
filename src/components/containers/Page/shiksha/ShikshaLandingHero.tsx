import {
  FlexContainer,
  Image,
  LinkButton,
  Section,
  SectionHeaderContainer,
  Text,
} from '@/components';

const ShikshaLandingHero = () => {
  return (
    <Section>
      <FlexContainer
        justifyCenter={true}
        className='py-2 sm:py-6'
        direction='col'
      >
        <FlexContainer
          justifyCenter={true}
          itemCenter={true}
          className='wrap-reverse flex-col flex-col-reverse gap-6 lg:flex-row'
          wrap={false}
        >
          <FlexContainer direction='col'>
            <FlexContainer direction='col'>
              <SectionHeaderContainer
                headingLevel={2}
                heading='Prepare 12th Computer'
                focusText='For Boards'
              />
              <Text
                level='p'
                className='paragraph mt-2 w-full text-center text-grey'
              >
                Live Preparation for 12th Computer Science Board Exams
              </Text>
            </FlexContainer>
            <FlexContainer className='mt-4 w-full gap-2'>
              <LinkButton
                href='https://docs.google.com/forms/d/e/1FAIpQLSfKtAwaCN5sXxPRAmcD1ETa9NnZD2VjTVAG3byVbqds6J2OdQ/viewform?usp=sf_link'
                className='w-full sm:w-fit'
                target='BLANK'
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Know More',
                }}
              />
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default ShikshaLandingHero;
