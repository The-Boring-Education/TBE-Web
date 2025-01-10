import React from 'react';
import {
  LandingPageHero,
  SEO,
  LinkButton,
  Section,
  Text,
  FlexContainer,
  WebibarCard,
  ToggleButton,
} from '@/components';
import { WebinarsLandingPageProps } from '@/interfaces';
import { getWebinarLandingPageProps } from '@/utils';
import { STATIC_FILE_PATH, routes } from '@/constant';

const Home = ({ seoMeta, webinars }: WebinarsLandingPageProps) => {
  const [filteredWebinars, setFilteredWebinars] = React.useState(webinars);

  const handleToggle = (activeOption: string) => {
    if (activeOption === 'Upcoming') {
      setFilteredWebinars(webinars.filter((webinar) => !webinar.isCompleted));
    } else if (activeOption === 'Past') {
      setFilteredWebinars(webinars.filter((webinar) => webinar.isCompleted));
    } else {
      setFilteredWebinars(webinars);
    }
  };

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        sectionHeaderProps={{
          heading: 'Learn Industry Skills',
          focusText: 'with Live Workshops',
        }}
        heroText='Missing Trending Tech Skills? Join our Weekend Workshops and learn in 2 Hours.'
        primaryButton={
          <LinkButton
            href={`#${routes.internals.landing.webinar}`}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Workshops',
              className: 'w-full',
            }}
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/webinar-hero.svg`}
      />
      <Section id={routes.internals.landing.webinar}>
        <FlexContainer direction='col' className='gap-4 md:gap-6'>
          <Text level='h4' className='heading-4' textCenter={true}>
            Our Workshops
          </Text>
          <ToggleButton
            options={['All', 'Upcoming', 'Past']}
            activeColor='gradient-4'
            inactiveColor='bg-accent'
            onToggle={handleToggle}
          />
          <FlexContainer className='gap-2'>
            {filteredWebinars.length > 0 ? (
              filteredWebinars.map((webinar, index) => {
                return <WebibarCard key={index} {...webinar} />;
              })
            ) : (
              <Text level='span' className='text-center strong-text'>
                No webinars available.
              </Text>
            )}
          </FlexContainer>
        </FlexContainer>
      </Section>
    </React.Fragment>
  );
};

export const getServerSideProps = getWebinarLandingPageProps;

export default Home;
