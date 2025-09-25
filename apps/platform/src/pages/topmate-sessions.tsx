import { Fragment } from 'react';

import { FlexContainer, Image,LandingPageHero, LinkButton, Section, SectionHeaderContainer, SEO, Text } from '@/components';
import { getSEOMeta, MENTORSHIP_SERVICES_CARDS, routes,STATIC_FILE_PATH } from '@/constant';

// Custom card component specifically for topmate-sessions
const TopmateServiceCard = ({ card }: { card: any }) => (
  <div className="w-full bg-white rounded-2 shadow-sm border-2 border-accent hover:shadow-lg transition-all duration-300 p-6 h-full flex flex-col">
    {card.image && (
      <div className="flex justify-center mb-4">
        <Image
          alt={card.imageAltText}
          className='w-20 h-20 object-contain'
          src={card.image}
        />
      </div>
    )}
    <div className='text-center flex-1 flex flex-col justify-between'>
      <div>
        <Text className='heading-5 font-bold text-contentLight mb-3' level='h5'>
          {card.title}
        </Text>
        <Text className='pre-title text-grey mb-4 leading-relaxed' level='p'>
          {card.content}
        </Text>
        {card.launchingOn && (
          <Text className='pre-title text-primary mb-4' level='p'>
            {card.launchingOn}
          </Text>
        )}
      </div>
      <LinkButton
        active={card.active}
        buttonProps={{
          variant: 'PRIMARY',
          text: card.active && card.ctaText ? card.ctaText : 'Coming soon',
          active: card.active,
          className: `${!card.active && 'bg-secondary'} w-full py-3`,
        }}
        className='block mt-auto'
        href={card.href}
        target={card.target}
      />
    </div>
  </div>
);

const TopmateSessionsPage = () => {
  const seoMeta = getSEOMeta(routes.home);

  // Debug: Log the data being used
  console.log('MENTORSHIP_SERVICES_CARDS:', MENTORSHIP_SERVICES_CARDS);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/mentorship.svg`}
        heroText='Connect with industry professionals for personalized guidance on your tech career journey'
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Book Your Session',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href='https://topmate.io/imsks/'
            target='_blank'
          />
        }
        secondaryButton={
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'View Services',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href='#services'
          />
        }
        sectionHeaderProps={{
          heading: 'Get',
          focusText: 'Personalized Mentorship',
        }}
      />
      
      {/* Custom Services Section */}
      <Section className='md:px-8 md:py-16 px-2 py-8'>
        <div className="max-w-6xl mx-auto">
          <FlexContainer className='gap-12' direction='col'>
            <SectionHeaderContainer
              focusText='Our Services'
              heading='Choose Your Mentorship Session'
              subtext='Select from our range of personalized mentorship services designed to accelerate your career growth'
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 px-4">
              {MENTORSHIP_SERVICES_CARDS.map((card) => (
                <TopmateServiceCard key={card.id} card={card} />
              ))}
            </div>
          </FlexContainer>
        </div>
      </Section>

      {/* Why Choose Us Section */}
      <Section className='md:px-8 md:py-16 px-2 py-8 bg-lightBG'>
        <FlexContainer className='gap-8' direction='col'>
          <SectionHeaderContainer
            focusText='Why Choose Us'
            heading='Expert Mentorship'
            headingLevel={2}
            subtext='Get personalized guidance from industry professionals who have walked the same path'
          />
          <FlexContainer className='gap-6 md:flex-row flex-col'>
            <div className='flex-1 bg-white p-6 rounded-2 shadow-sm'>
              <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-2xl'>🎯</span>
              </div>
              <Text level='h4' className='font-bold mb-2'>Personalized Approach</Text>
              <Text level='p' className='text-grey'>Every session is tailored to your specific needs, goals, and current skill level</Text>
            </div>
            <div className='flex-1 bg-white p-6 rounded-2 shadow-sm'>
              <div className='w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-2xl'>💼</span>
              </div>
              <Text level='h4' className='font-bold mb-2'>Industry Experience</Text>
              <Text level='p' className='text-grey'>Learn from professionals working at top tech companies with real-world insights</Text>
            </div>
            <div className='flex-1 bg-white p-6 rounded-2 shadow-sm'>
              <div className='w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-2xl'>🚀</span>
              </div>
              <Text level='h4' className='font-bold mb-2'>Proven Results</Text>
              <Text level='p' className='text-grey'>Join hundreds of students who have successfully landed their dream tech jobs</Text>
            </div>
          </FlexContainer>
        </FlexContainer>
      </Section>

      {/* How It Works Section */}
      <Section className='md:px-8 md:py-16 px-2 py-8'>
        <FlexContainer className='gap-8' direction='col'>
          <SectionHeaderContainer
            focusText='How It Works'
            heading='Simple 3-Step Process'
            headingLevel={2}
            subtext='Get started with your mentorship journey in just a few clicks'
          />
          <FlexContainer className='gap-6 md:flex-row flex-col'>
            <div className='flex-1 text-center'>
              <div className='w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>1</div>
              <Text level='h4' className='font-bold mb-2'>Book Your Session</Text>
              <Text level='p' className='text-grey'>Choose your preferred service and time slot from our available mentors</Text>
            </div>
            <div className='flex-1 text-center'>
              <div className='w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>2</div>
              <Text level='h4' className='font-bold mb-2'>Connect & Learn</Text>
              <Text level='p' className='text-grey'>Join your video session and get personalized guidance from industry experts</Text>
            </div>
            <div className='flex-1 text-center'>
              <div className='w-16 h-16 bg-success text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>3</div>
              <Text level='h4' className='font-bold mb-2'>Apply & Grow</Text>
              <Text level='p' className='text-grey'>Implement the advice and watch your career take off with newfound confidence</Text>
            </div>
          </FlexContainer>
        </FlexContainer>
      </Section>

      {/* CTA Section */}
      <Section className='md:px-8 md:py-16 px-2 py-8 bg-primary text-white'>
        <FlexContainer className='gap-6 text-center' direction='col'>
          <Text level='h2' className='font-bold text-2xl md:text-3xl'>Ready to Transform Your Tech Career?</Text>
          <Text level='p' className='text-white/90 max-w-2xl mx-auto'>Join hundreds of students who have already taken the first step towards their dream tech job. Book your session today!</Text>
          <FlexContainer className='gap-4 md:flex-row flex-col'>
            <LinkButton
              buttonProps={{
                variant: 'SECONDARY',
                text: 'Book Your Session Now',
                className: 'w-full md:w-fit',
              }}
              className='w-full md:w-fit'
              href='https://topmate.io/imsks/'
              target='_blank'
            />
            <LinkButton
              buttonProps={{
                variant: 'OUTLINE',
                text: 'Learn More',
                className: 'w-full md:w-fit text-white border-white hover:bg-white/10',
              }}
              className='w-full md:w-fit'
              href='#services'
            />
          </FlexContainer>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export default TopmateSessionsPage;
