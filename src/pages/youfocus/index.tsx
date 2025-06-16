import { Fragment } from 'react';

import { CardContainerA, LandingPageHero, LinkButton, SEO } from '@/components';
import { routes, STATIC_FILE_PATH, YOUFOCUS_FEATURES } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/youfocus.svg`}
        heroText='Just Paste Your YouTube Playlist and Start Learning'
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Add YouTube Playlist',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href={routes.youfocusAddPlaylist}
          />
        }
        secondaryButton={
          <LinkButton
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Explore Playlists',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href={routes.explorePlaylist}
          />
        }
        sectionHeaderProps={{
          heading: 'Learn From YouTube',
          focusText: 'without Distractions',
        }}
      />
      <CardContainerA
        borderColour={4}
        cards={YOUFOCUS_FEATURES}
        focusText='Differently?'
        heading='What We Do'
      />
    </Fragment>
  );

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.youfocus })),
  });

export default Home;
