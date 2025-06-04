import { PageProps } from '@/interfaces';
import { CardContainerA, LandingPageHero, LinkButton, SEO } from '@/components';
import { getPreFetchProps } from '@/utils';
import { routes, STATIC_FILE_PATH, YOUFOCUS_FEATURES } from '@/constant';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        sectionHeaderProps={{
          heading: 'Learn From YouTube',
          focusText: 'without Distractions',
        }}
        heroText='Just Paste Your YouTube Playlist and Start Learning'
        primaryButton={
          <LinkButton
            href={routes.youfocusAddPlaylist}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Add YouTube Playlist',
              className: 'w-full',
            }}
          />
        }
        secondaryButton={
          <LinkButton
            href={routes.explorePlaylist}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Explore Playlists',
              className: 'w-full',
            }}
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/youfocus.svg`}
      />
      <CardContainerA
        heading='What We Do'
        focusText='Differently?'
        cards={YOUFOCUS_FEATURES}
        borderColour={4}
      />
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.youfocus })),
  };
};

export default Home;
