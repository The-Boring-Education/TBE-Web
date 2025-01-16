import { Playlist}  from '@/database';

// Check if a playlist exists by its ID
export const checkPlaylistExistsByPlaylistId = async (playlistId: string) => {
  try {
    const existingPlaylist = await Playlist.findOne({ playlistId });
    return existingPlaylist
      ? { exists: true, message: 'Playlist already exists' }
      : { exists: false };
  } catch (error) {
    throw new Error('Error checking playlist existence');
  }
};

// Fetch all playlists
export const getAllPlaylistdata = async () => {
  try {
    const data = await Playlist.find();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: 'Error fetching playlists' };
  }
};
