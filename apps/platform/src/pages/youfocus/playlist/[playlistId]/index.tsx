import {
  PlaylistContainer,
  ScrollToTopBottomButton,
  Section,
  SEO,
} from '@tbe/components';
import type { PlaylistPageProps } from '@tbe/interface';
import { getPlaylistPageProps } from '@tbe/utils';
import { Fragment } from 'react';

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
