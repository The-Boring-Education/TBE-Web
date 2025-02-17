import React, { useState } from 'react';
import { PageProps } from '@/interfaces';
import { useRouter } from 'next/router';
import {
  Button,
  FlexContainer,
  Section,
  SectionHeaderContainer,
  SEO,
  InputFieldContainer,
} from '@/components';
import { getPreFetchProps } from '@/utils';
import { useApi, useUser } from '@/hooks';
import { routes } from '@/constant';

const Home = ({ seoMeta }: PageProps) => {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();

  const [playlistUrl, setPlaylistUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setPlaylistUrl(value);
    setError(null);
  };

  const { makeRequest, loading } = useApi('youfocus-add-playlist');

  const handleAddPlaylist = async () => {
    if (!playlistUrl) {
      setError('Playlist link is required');
      return;
    }

    try {
      const response = await makeRequest({
        method: 'POST',
        url: `${routes.api.youfocusPlaylist}?userId=${userId}`,
        body: { playlistUrl },
      });
      // console.log(response);
      const { status } = response;
      if (status) {
        setSuccess('Playlist added successfully! Redirecting...');
        setPlaylistUrl('');
        setTimeout(() => {
          const playlistId = response.data._id;
          const redirectUrl = `${routes.youfocusPlaylist}/${playlistId}`;
          router.push(redirectUrl);
        }, 2000);
      } else {
        setError(response.message || 'Failed to add playlist');
      }
    } catch (error) {
      setError('Failed to add playlist. Please try again later.');
    }
  };

  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <FlexContainer direction='col' className='md:gap-6 gap-4'>
          <SectionHeaderContainer
            heading='Add Your'
            focusText='Playlist'
            headingLevel={2}
            subtext='Learn Undistracted with Youtube Playlist'
          />
          <FlexContainer className='gap-3 w-full' direction='col'>
            <InputFieldContainer
              label='Paste YouTube Playlist Link'
              type='text'
              onChange={handleInputChange}
              className='md:w-1/2 md:px-5 text-black'
            />

            <Button
              variant='PRIMARY'
              className=''
              text='Add Playlist'
              active={!!playlistUrl || !error}
              isLoading={loading}
              onClick={handleAddPlaylist}
            />
            {error && <p className='error text-red-500'>{error}</p>}
            {success && <p className='success text-green-500'>{success}</p>}
          </FlexContainer>
        </FlexContainer>
      </Section>
    </React.Fragment>
  );
};
export const getServerSideProps = getPreFetchProps;
export default Home;
