import { useRouter } from 'next/router';
import React, { Fragment } from 'react';

import {
  FlexContainer,
  PlaylistSkillCard,
  Section,
  SectionHeaderContainer,
  SEO,
  Toast,
} from '@/components';
import { useSkillPlaylist } from '@/hooks';
import type { PageProps } from '@/interfaces';
import { getSkillPlaylistPageProps, getYoufocusSkillName } from '@/utils';

const Explore = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { q } = router.query;
  const skillQuery = typeof q === 'string' ? q : '';
  const { playlists, loading, errorMessage } = useSkillPlaylist(skillQuery);

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer
          className='w-full justify-center items-center md:gap-8 gap-4'
          direction='col'
        >
          <div className='w-full max-w-md'>
            <SectionHeaderContainer
              focusText='Playlist'
              heading={`${getYoufocusSkillName(q as string)}`}
              headingLevel={3}
              subtext='Pick A Playlist and Start Learning'
            />
          </div>

          {loading && <Toast message='Playlists Loading...' />}
          {errorMessage && <Toast message={errorMessage} type='error' />}

          <FlexContainer className='w-full md:gap-4 gap-2'>
            {playlists.length > 0 &&
              playlists.map((playlist, key) => {
                const { _id, playlistName, thumbnail, referrerBy, videos } =
                  playlist;

                return (
                  <PlaylistSkillCard
                    key={key}
                    _id={_id}
                    noOfVideos={videos ? videos.length : 0}
                    playlistName={playlistName}
                    referrerBy={referrerBy}
                    thumbnail={thumbnail}
                  />
                );
              })}
          </FlexContainer>
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getSkillPlaylistPageProps;
export default Explore;
