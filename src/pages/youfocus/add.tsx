import { useRouter } from 'next/router';
import { Fragment, useState } from 'react';

import {
  Button,
  ExplorePlaylistContainer,
  FlexContainer,
  InputFieldContainer,
  Section,
  SectionHeaderContainer,
  SEO,
  Toast,
} from '@/components';
import { routes } from '@/constant';
import { useApi, useUser } from '@/hooks';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();

  const [playlistUrl, setPlaylistUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setPlaylistUrl(value);
    setErrorMessage(null);
  };

  const { makeRequest, loading } = useApi('youfocus-add-playlist');

  const handleAddPlaylist = async () => {
    if (!playlistUrl) {
      setErrorMessage('Playlist link is required');
      return;
    }

    try {
      const response = await makeRequest({
        method: 'POST',
        url: `${routes.api.youfocusPlaylist}?userId=${userId}`,
        body: { playlistUrl },
      });

      if (response?.status && response.data?._id) {
        setSuccessMessage('Playlist added successfully! Redirecting...');
        setPlaylistUrl('');
        setTimeout(() => {
          router.push(`${routes.youfocusPlaylist}/${response.data._id}`);
        }, 2000);
      } else {
        setErrorMessage(response?.message || 'Failed to add playlist');
      }
    } catch (error) {
      setErrorMessage('Failed to add playlist. Please try again later.');
    }
  };

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer className='gap-4 items-baseline'>
          <FlexContainer
            className='gap-6 px-4 py-4 md:px-8 md:py-8 self-stretch border rounded-2'
            direction='col'
          >
            <SectionHeaderContainer
              focusText='Playlist'
              heading='Add Your'
              headingLevel={4}
              subtext='Learn Undistracted with YouTube Playlist'
            />
            <FlexContainer className='gap-3 w-full' direction='col'>
              <InputFieldContainer
                label='Paste YouTube Playlist Link'
                type='text'
                value={playlistUrl}
                onChange={handleInputChange}
              />
              <Button
                active={!!playlistUrl}
                className='m-auto'
                isLoading={loading}
                text='Add Playlist'
                variant='PRIMARY'
                onClick={handleAddPlaylist}
              />
              {errorMessage && <Toast message={errorMessage} type='error' />}
              {successMessage && (
                <Toast message={successMessage} type='success' />
              )}
            </FlexContainer>
          </FlexContainer>
          <ExplorePlaylistContainer
            focusText='Playlist?'
            heading='Don’t Have A'
            subtext='Select an Skill, We’ll Recommend Playlists'
          />
        </FlexContainer>
      </Section>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.youfocusAddPlaylist })),
});

export default Home;
