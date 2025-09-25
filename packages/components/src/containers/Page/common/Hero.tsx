import {
  FlexContainer,
  Image,
  Section,
  SectionHeaderContainer,
  Text,
} from '@tbe/components';
import type { LandingPageHeroProps } from '@tbe/interface';
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
      <FlexContainer className='py-2 sm:py-6' direction='col' justifyCenter>
        <FlexContainer
          className='wrap-reverse flex-col-reverse gap-6 lg:flex-row'
          itemCenter
          justifyCenter
          wrap={false}
        >
          <FlexContainer
            className='justify-center lg:justify-start'
            direction='col'
          >
            <FlexContainer direction='col'>
              <SectionHeaderContainer
                focusText={focusText}
                heading={heading}
                headingLevel={3}
              />
              <Text
                className='paragraph mt-1 w-full text-center text-grey lg:text-left'
                level='p'
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
            alt='landing-page-hero-image'
            className='w-64'
            fullWidth={false}
            loading='eager'
            src={backgroundImageUrl}
          />
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default LandingPageHero;
