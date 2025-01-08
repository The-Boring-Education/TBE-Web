import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes } from '@/constant';
import { sendAPIResponse } from '@/utils';
import Playlist from '@/database/models/Youfocus/Playlist';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleAddPlaylist(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${method} not allowed`,
      });
  }
};
const handleAddPlaylist = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { playlistUrl } = req.body;

    if (!playlistUrl) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Playlist URL is required',
      });
    }

    // Extract playlist ID from the URL
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid playlist URL',
      });
    }

    // Check if the playlist ID already exists in the database
    const existingPlaylist = await Playlist.findOne({ playlistId });
    if (existingPlaylist) {
      return res.status(apiStatusCodes.OKAY).json({
        success: false,
        message: 'Playlist already exists in the database',
        data: existingPlaylist,
      });
    }

    // Fetch playlist data using YouTube Data API
    const youtubeData = await fetchPlaylistData(playlistUrl);

    if (!youtubeData) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Failed to fetch playlist data from YouTube',
      });
    }

    // Create and save the new playlist with video details
    const newPlaylist = await Playlist.create({
      playlistUrl,
      videos: youtubeData.videos,
    });

    return res.status(apiStatusCodes.RESOURCE_CREATED).json({
      success: true,
      message: 'Playlist added successfully',
      data: newPlaylist,
    });
  } catch (error) {
    console.error('Error adding playlist:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to add playlist',
    });
  }
};


const fetchPlaylistData = async (url: string) => {
  try {
    // Extract playlist ID from the URL
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      console.error('Invalid playlist ID');
      return null;
    }

    let allVideos: { title: string, videoId: string, thumbnail: string }[] = [];
    let nextPageToken: string | undefined = '';

    // Loop to handle pagination and fetch all videos
    while (nextPageToken !== undefined) {
      // Use the YouTube Data API to fetch playlist details with fetch
      const response: any = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${process.env.YOUTUBE_API_KEY}`
      );

      // Log the response status and body for debugging
      console.log('Response Status:', response.status);
      const data = await response.json();
      console.log('Response Data:', data);

      if (!response.ok) {
        throw new Error(`Failed to fetch data from YouTube: ${data.error.message}`);
      }

      // Extract videos from the current page of the response
      const videos = data.items.map((item: any) => {
        const thumbnail = item.snippet.thumbnails?.default?.url || ''; // Default to empty string if no thumbnail
        return {
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          thumbnail,
        };
      });

      // Add the videos to the allVideos array
      allVideos = [...allVideos, ...videos];

      // Check if there's another page of results
      nextPageToken = data.nextPageToken;
    }

    return { videos: allVideos };
  } catch (error) {
    console.error('Error fetching YouTube playlist data:', error);
    return null;
  }
};

// Function to extract playlist ID from URL (e.g., https://www.youtube.com/playlist?list=...)
const extractPlaylistId = (url: string) => {
  const regex = /[?&]list=([^&]+)/; // Handles playlist URLs with parameters
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default handler;
