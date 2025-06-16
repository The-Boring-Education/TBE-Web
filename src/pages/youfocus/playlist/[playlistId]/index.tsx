import { Fragment } from 'react';

import {
  PlaylistContainer,
  ScrollToTopBottomButton,
  Section,
  SEO,
} from '@/components';
import type { PlaylistPageProps } from '@/interfaces';
import { getPlaylistPageProps } from '@/utils';

const PlaylistPage = ({
  playlist: {
    _id,
    playlistName,
    description,
    thumbnail,
    videos,
    learningTime,
    isRecommended,
  },
  seoMeta,
}: PlaylistPageProps) => (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='p-2'>
        <PlaylistContainer
          description={description}
          id={_id.toString()}
          isRecommended={isRecommended}
          learningTime={learningTime}
          playlistName={playlistName}
          thumbnail={thumbnail}
          videos={videos}
        />
        <ScrollToTopBottomButton />
      </Section>
    </Fragment>
  );

export const getServerSideProps = getPlaylistPageProps;
export default PlaylistPage;
