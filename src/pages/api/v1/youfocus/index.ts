import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/middlewares';
import { apiStatusCodes } from '@/constant';
import { Playlist } from '@/database';

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

// Function to handle adding a new playlist
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
    const existingPlaylist = await Playlist.findOne({ playlistUrl });
    if (existingPlaylist) {
      return res.status(apiStatusCodes.OKAY).json({
        success: false,
        message: 'Playlist already exists in the database',
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
      playlistName: youtubeData.playlistName,
      channelName: youtubeData.channelName,
      description: youtubeData.description,
      videos: youtubeData.videos,
    });

    return res.status(apiStatusCodes.RESOURCE_CREATED).json({
      success: true,
      message: 'Playlist added successfully',
    });
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to add playlist',
    });
  }
};

// Function to fetch playlist metadata
const fetchPlaylistMetadata = async (playlistId: string) => {
  try {
    const metadataResponse: any = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const metadata = await metadataResponse.json();

    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch playlist metadata: ${metadata.error.message}`);
    }

    if (!metadata.items || metadata.items.length === 0) {
      throw new Error('No playlist metadata found.');
    }

    const playlistName = metadata.items[0].snippet.title;
    const channelName = metadata.items[0].snippet.channelTitle;
    const description = metadata.items[0].snippet.description;

    return { playlistName, channelName, description };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch playlist metadata",
    };
  }
};

// Function to extract playlist ID from a YouTube playlist URL
const fetchPlaylistData = async (url: string) => {
  try {
    // Extract playlist ID from the URL
    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      return null;
    }

    // Fetch playlist metadata using the new function
    const metadata = await fetchPlaylistMetadata(playlistId);
    if (!metadata) {
      return null;
    }

    const { playlistName, channelName, description } = metadata;

    // Fetch all videos in the playlist
    let allVideos: { title: string, videoId: string, thumbnail: string }[] = [];
    let nextPageToken: string | undefined = '';

    // Loop to handle pagination and fetch all videos
    while (nextPageToken !== undefined) {
      const response: any = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${process.env.YOUTUBE_API_KEY}`
      );

      // Log the response status and body for debugging
      const data = await response.json();
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

    return { playlistName, channelName, description, videos: allVideos };
  } catch (error) {

    return null;
  }
};

// Function to extract playlist ID from URL (e.g., https://www.youtube.com/playlist?list=...)
const extractPlaylistId = (url: string) => {
  const regex = /(?:list=|\/playlist\/)([a-zA-Z0-9_-]{10,})/; // Handles playlist URLs with parameters
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default handler;
