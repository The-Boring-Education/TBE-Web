import {
  FlexContainer,
  GradientContainer,
  LinkButton,
  Section,
  SectionHeaderContainer,
  Text,
} from '@/components';
import { generateSectionPath, routes } from '@/constant';
import { MicrocampHeaderProps } from '@/interfaces';
import { useRouter } from 'next/router';

const MicroCampLandingHeader = ({
  heading,
  subheading,
  cta,
}: MicrocampHeaderProps) => {
  const router = useRouter();

  return (
    <Section>
      <GradientContainer className='gradient-6 rounded-2'>
        <FlexContainer className='py-2 md:px-12 md:py-8' direction='col'>
          <FlexContainer itemCenter={true} justifyCenter={true}>
            <SectionHeaderContainer
              heading='The Boring'
              focusText='Micro-camp'
              headingLevel={5}
              className='text-dark'
            />
          </FlexContainer>
          <FlexContainer direction='col' itemCenter={true} className='pt-5'>
            <FlexContainer
              direction='col'
              justifyCenter={true}
              className='w-full'
            >
              <Text
                level='h2'
                className='heading-3 md:heading-2 text-dark'
                textCenter={true}
              >
                {heading.primary}{' '}
                <Text
                  level='span'
                  className='heading-3 md:heading-2 text-primary md:text-primary'
                >
                  {heading.secondary}{' '}
                </Text>
              </Text>
              <Text
                level='p'
                className='strong-text pt-1 text-dark'
                textCenter={true}
              >
                {subheading}
              </Text>
            </FlexContainer>
            <FlexContainer justifyCenter={true} className='w-full gap-2 pt-4'>
              <LinkButton
                href={`#${cta.primary}`}
                buttonProps={{ variant: 'PRIMARY', text: 'Register now' }}
                className='w-full md:w-auto'
              />
              <LinkButton
                href={generateSectionPath({
                  basePath: router.basePath,
                  sectionID: routes.internals.microCampLanding.explore,
                })}
                buttonProps={{
                  variant: 'OUTLINE',
                  text: 'Explore',
                  className: 'bg-white',
                }}
                className='w-full md:w-auto'
              />
            </FlexContainer>
          </FlexContainer>
        </FlexContainer>
      </GradientContainer>
    </Section>
  );
};

export default MicroCampLandingHeader;
