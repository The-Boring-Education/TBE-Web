import {
  FlexContainer,
  Image,
  Section,
  SectionHeaderContainer,
  Text,
} from '@/components';
import { LandingPageHeroProps } from '@/interfaces';
const LandingPageHero = ({
  sectionHeaderProps,
  primaryButton,
  secondaryButton,
  backgroundImageUrl,
  heroText,
}: LandingPageHeroProps) => {
  const { heading, focusText } = sectionHeaderProps;
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
          className='wrap-reverse flex-col-reverse gap-6 lg:flex-row'
          wrap={false}
        >
          <FlexContainer
            direction='col'
            className='justify-center lg:justify-start'
          >
            <FlexContainer direction='col'>
              <SectionHeaderContainer
                headingLevel={3}
                heading={heading}
                focusText={focusText}
              />
              <Text
                level='p'
                className='paragraph mt-1 w-full text-center text-grey lg:text-left'
              >
                {heroText}
              </Text>
            </FlexContainer>
            <FlexContainer className='mt-4 w-full justify-center gap-2 lg:justify-start'>
              {primaryButton}
              {secondaryButton}
            </FlexContainer>
          </FlexContainer>
          <Image
            src={backgroundImageUrl}
            className='w-64'
            fullWidth={false}
            alt='landing-page-hero-image'
            loading='eager'
          />
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default LandingPageHero;
