import {
  FlexContainer,
  LandingPageHero,
  LinkButton,
  Section,
  SEO,
  Text,
  ToggleButton,
  WebibarCard,
} from '@tbe/components';
import { routes, STATIC_FILE_PATH } from '@tbe/constants';
import type { WebinarsLandingPageProps } from '@tbe/interface';
import { getWebinarLandingPageProps } from '@tbe/utils';
import { Fragment, useState } from 'react';

const Home = ({ seoMeta, webinars }: WebinarsLandingPageProps) => {
  const [filteredWebinars, setFilteredWebinars] = useState(webinars);

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
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/webinar-hero.svg`}
        heroText='Missing Trending Tech Skills? Join our Weekend Workshops and learn in 2 Hours.'
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Workshops',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href={`#${routes.internals.landing.webinar}`}
          />
        }
        sectionHeaderProps={{
          heading: 'Learn Industry Skills',
          focusText: 'with Live Workshops',
        }}
      />
      <Section id={routes.internals.landing.webinar}>
        <FlexContainer className='gap-4 md:gap-6' direction='col'>
          <Text className='heading-4' level='h4' textCenter>
            Our Workshops
          </Text>
          <ToggleButton
            activeColor='gradient-4'
            inactiveColor='bg-accent'
            options={['All', 'Upcoming', 'Past']}
            onToggle={handleToggle}
          />
          <FlexContainer className='gap-2'>
            {filteredWebinars.length > 0 ? (
              filteredWebinars.map((webinar, index) => (
                <WebibarCard key={index} {...webinar} />
              ))
            ) : (
              <Text className='text-center strong-text' level='span'>
                No webinars available.
              </Text>
            )}
          </FlexContainer>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getWebinarLandingPageProps;

export default Home;
