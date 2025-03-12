import React, { Fragment } from 'react';
import { useRouter } from 'next/router';
import {
  FlexContainer,
  PlaylistSkillCard,
  Section,
  SectionHeaderContainer,
  SEO,
  Toast,
} from '@/components';
import { useSkillPlaylist } from '@/hooks';
import { getSkillPlaylistPageProps, getYoufocusSkillName } from '@/utils';
import { PageProps } from '@/interfaces';

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
          direction='col'
          className='w-full justify-center items-center md:gap-8 gap-4'
        >
          <div className='w-full max-w-md'>
            <SectionHeaderContainer
              heading={`${getYoufocusSkillName(q as string)}`}
              focusText='Playlist'
              headingLevel={3}
              subtext='Pick A Playlist and Start Learning'
            />
          </div>

          {loading && <Toast message='Playlists Loading...' />}
          {errorMessage && <Toast type='error' message={errorMessage} />}

          <FlexContainer className='w-full md:gap-4 gap-2'>
            {playlists.length > 0 &&
              playlists.map((playlist, key) => {
                const { _id, playlistName, thumbnail, referrerBy, videos } =
                  playlist;

                return (
                  <PlaylistSkillCard
                    key={key}
                    _id={_id}
                    playlistName={playlistName}
                    thumbnail={thumbnail}
                    referrerBy={referrerBy}
                    noOfVideos={videos ? videos.length : 0}
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
