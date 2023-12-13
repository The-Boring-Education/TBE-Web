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
          <FlexContainer
            direction='col'
            className='justify-center lg:justify-start'
          >
            <FlexContainer direction='col'>
              <SectionHeaderContainer
                headingLevel={2}
                heading='Tech Education for'
                focusText='Everyone'
              />
              <Text
                level='p'
                className='paragraph mt-2 w-full text-center text-grey lg:text-left'
              >
                Learn Tech Skills & Prepare yourself for a Tech Job.
              </Text>
            </FlexContainer>
            <FlexContainer className='mt-4 w-full justify-center gap-2 lg:justify-start'>
              <LinkButton
                href=''
                className='w-full sm:w-fit'
                buttonProps={{
                  variant: 'PRIMARY',
                  text: 'Register',
                  className: '',
                }}
              />
              <LinkButton
                href=''
                className='w-full sm:w-fit'
                buttonProps={{
                  variant: 'OUTLINE',
                  text: 'Course',
                  className: '',
                }}
              />
            </FlexContainer>
          </FlexContainer>
          <Image
            src='https://ik.imagekit.io/tbe/webapp/hero-image.svg'
            className='w-64'
            fullWidth={false}
            alt='hihi'
          />
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default ShikshaLandingHero;
