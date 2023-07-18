import {
  FlexContainer,
  GridContainer,
  MicroCampFeatureCard,
  Section,
  SectionHeaderContainer,
  Text,
} from '@/components';
import { routes } from '@/constant';
import { MicrocampInThisCohortSectionProps } from '@/interfaces';

const InThisCohortContainer = ({
  label,
  features,
}: MicrocampInThisCohortSectionProps) => {
  return (
    <Section id={routes.internals.microCampLanding.explore}>
      <FlexContainer direction='col'>
        <FlexContainer direction='col'>
          <Text level='p' className='strong-text text-contentLight'>
            IN THIS COHORT
          </Text>
          <SectionHeaderContainer
            heading='Learn Fundamentals of'
            focusText={label}
            headingLevel={4}
            className='pt-2'
          />
        </FlexContainer>

        <GridContainer className='w-full grid-cols-3 grid-cols-[repeat(auto-fit,minmax(100%,1fr))] gap-1 pt-5 md:grid-cols-[repeat(auto-fit,minmax(24rem,1fr))]'>
          {features.map((item) => {
            const { id } = item;
            return <MicroCampFeatureCard key={id} {...item} />;
          })}
        </GridContainer>
      </FlexContainer>
    </Section>
  );
};

export default InThisCohortContainer;
