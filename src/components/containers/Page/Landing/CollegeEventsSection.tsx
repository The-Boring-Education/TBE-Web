import { FlexContainer, LinkButton, Section, Text } from '@/components';
import { LINKS } from '@/constant';

const CollegeEventsSection = () => (
  <Section className='md:px-8 md:py-8 px-2 py-4'>
    <FlexContainer justifyCenter={false}>
      <FlexContainer className='w-full rounded-2 gradient-7 gap-4 md:px-12 md:py-12 px-4 py-4 shadow-lg sm:px-12 sm:py-12 lg:px-8 lg:py-12'>
        <FlexContainer
          direction='col'
          itemCenter
          className='w-full max-w-4xl gap-2'
        >
          <Text className='heading-3 text-contentLight' level='h3' textCenter>
            Host TBE at Your College
          </Text>

          <Text className='paragraph text-contentLight' level='p' textCenter>
            Bring cutting-edge tech education to your campus! Join our network
            of college partners and host exciting tech events, workshops, and
            learning sessions.
          </Text>
        </FlexContainer>
        <FlexContainer className='w-full gap-6 flex-wrap justify-center' wrap>
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Apply to Host Events',
              className: 'w-full sm:w-auto',
              animationType: 'GLOW',
            }}
            className='w-full sm:w-auto'
            href={LINKS.hostTBEAtYourCollege}
            target='_blank'
          />
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'View Session Details',
              className: 'w-full sm:w-auto',
              animationType: 'BOUNCE',
            }}
            className='w-full sm:w-auto'
            href={LINKS.viewSessionDetails}
            target='_blank'
          />
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  </Section>
);

export default CollegeEventsSection;
