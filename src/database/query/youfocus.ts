import { DatabaseQueryResponseType } from '@/interfaces';
import Playlist from '../models/YouFocus/Playlist';
import axios from 'axios';
import { FetchPlaylistDataResultFromYoutube } from '@/interfaces';
import { envConfig } from '@/constant';

const getPlaylistfromIDfromDB = async (
  playlistId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const playlist = await Playlist.findOne({ playlistId });
    if (!playlist) return { error: 'Playlist not found' };
    return { data: playlist };
  } catch (error) {
    return { error };
  }
};

const fetchPlaylistData = async (
  playlistId: string
): Promise<FetchPlaylistDataResultFromYoutube> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems`;
    const params = {
      part: 'snippet',
      playlistId: playlistId,
      maxResults: 100,
      key: envConfig.YOUTUBE_API_KEY,
    };

    const response = await axios.get(url, { params });

    const videos = response.data.items.map((item: any) => ({
      title: item.snippet.title,
      videoId: item.snippet.resourceId.videoId,
      thumbnail: item.snippet.thumbnails.high.url,
    }));

    if (!videos) return { error: 'Not a valid playlist URL' };

    const playlistDetailsUrl = `https://www.googleapis.com/youtube/v3/playlists`;
    const playlistDetailsParams = {
      part: 'snippet',
      id: playlistId,
      key: envConfig.YOUTUBE_API_KEY,
    };

    const detailsResponse = await axios.get(playlistDetailsUrl, {
      params: playlistDetailsParams,
    });

    const playlistDetails = detailsResponse.data.items[0].snippet;

    if (!playlistDetails) return { error: 'Failed to fetch Playlist details' };

    const playlistData = {
      playlistId: playlistId,
      playlistName: playlistDetails.title,
      description: playlistDetails.description,
      videos: videos,
    };
    return { data: playlistData };
  } catch (error) {
    return { error };
  }
};

const addAplaylisttoDB = async (
  PlaylistId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const { error: ErrorinPlaylistID, data: playlistDetails } =
      await fetchPlaylistData(PlaylistId);

    if (ErrorinPlaylistID)
      return { error: 'Failed to fetch Playlist details.' };

    const playlist = await Playlist.create(playlistDetails);

    if (!playlist) return { error: 'Failed to add playlist to database' };

    return { data: playlist };
  } catch (error) {
    return { error };
  }
};

export { getPlaylistfromIDfromDB, addAplaylisttoDB };
