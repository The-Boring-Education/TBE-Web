import { PlaylistPageProps } from '@/interfaces';
import {
  SEO,
  PlaylistContainer,
  Section,
  ScrollToTopBottomButton,
} from '@/components';
import { getPlaylistPageProps } from '@/utils';
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
}: PlaylistPageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='p-2'>
        <PlaylistContainer
          id={_id.toString()}
          playlistName={playlistName}
          description={description}
          thumbnail={thumbnail}
          videos={videos}
          learningTime={learningTime}
          isRecommended={isRecommended}
        />
        <ScrollToTopBottomButton />
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getPlaylistPageProps;
export default PlaylistPage;
