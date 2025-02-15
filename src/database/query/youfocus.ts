import { Playlist, UserPlaylist, User } from '@/database';
import { DatabaseQueryResponseType, PlaylistModel } from '@/interfaces';

// Add a playlist to the database
const addPlaylistToDB = async (
  playlistDetails: PlaylistModel
): Promise<DatabaseQueryResponseType> => {
  try {
    const playlist = new Playlist(playlistDetails);
    await playlist.save();
    return { data: playlist };
  } catch (error) {
    return { error: 'Failed while adding playlist' };
  }
};

// Link a user to a playlist in `UserPlaylist`
const addUserPlaylistEntry = async (
  userId: string,
  playlistId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    // Check if Userplaylist exists
    const existingUserPlaylist = await UserPlaylist.findOne({
      userId,
      playlistId,
    });
    if (existingUserPlaylist) {
      return { error: 'UserPlaylist already exists' };
    }
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }
    const userPlaylist = new UserPlaylist({
      userId,
      playlistId,
    });

    await userPlaylist.save();
    return { data: userPlaylist };
  } catch (error) {
    return { error: 'Failed to link playlist to user' };
  }
};

// Check if a playlist exists by its ID
const checkPlaylistExistsByPlaylistId = async (
  playlistId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const existingPlaylist = await Playlist.findOne({ playlistId });

    if (!existingPlaylist) {
      return { error: 'Playlist does not exist' };
    }
    // Increment referrerBy only if playlist is found
    existingPlaylist.referrerBy = (existingPlaylist.referrerBy || 0) + 1;
    await existingPlaylist.save();

    return { data: existingPlaylist };
  } catch (error) {
    return { error };
  }
};

// Get Allplaylist data FormDB
const getPlaylistsFormDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const playlists = await Playlist.find();
    return { data: playlists };
  } catch (error) {
    return { error };
  }
};

// Get a playlist by its ID
const getUserPlaylistByIDFromDB = async (
  playlistId: string,
  userId?: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylist = await UserPlaylist.find({ playlistId, userId }).populate({
      path: 'playlistId',
    }).lean().exec();
    
    if (!userPlaylist) {
      return { error: 'Playlist not found' };
    }

    return { data: userPlaylist };
  } catch (error) {
    return { error };
  }
};

// Get all playlists of a user  from `UserPlaylist`
const getUserPlaylistsFromDB = async (
  userId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylists = await UserPlaylist.find({ userId }).populate(
      'playlist'
    );

    if (userPlaylists.length === 0) {
      return { error: 'User does not have any playlists' };
    }

    return { data: userPlaylists };
  } catch (error) {
    return { error: 'An error occurred while fetching playlists' };
  }
};

// Delete a userPlaylist form DB
const deleteUserPlaylistFromDB = async (
  userId: string,
  playlistId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylist = await UserPlaylist.findOneAndDelete({
      userId,
      playlistId,
    });
    if (!userPlaylist) {
      return { error: 'UserPlaylist not found' };
    }
    return { data: userPlaylist };
  } catch (error) {
    return { error: 'An error occurred while deleting userPlaylist' };
  }
};

const incrementReferrerCount = async (playlistId: string): Promise<any> => {
  return await Playlist.findByIdAndUpdate(
    playlistId,
    { $inc: { referrerBy: 1 } },
    { new: true, fields: { referrerBy: 1, _id: 0 } }
  );
};

const updateUserPlaylistData = async (
  userId: string,
  playlistId: string,
  isRecommended: boolean,
  learningTime: number
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylist = await UserPlaylist.findOne({ userId, playlistId });
    if (!userPlaylist) return { error: 'UserPlaylist not found' };

    // Update the UserPlaylist directly
    const updatedUserPlaylist = await UserPlaylist.findOneAndUpdate(
      { userId, playlistId },
      { $set: { isRecommended, learningTime } },
      { new: true }
    );
    if (!updatedUserPlaylist) return { error: 'Failed to update UserPlaylist' };

    // Only increment referrerBy if isRecommended changes from false to true
    let updatedPlaylist = null;
    if (isRecommended && !userPlaylist.isRecommended) {
      updatedPlaylist = await incrementReferrerCount(playlistId);
    }

    return { data: { updatedUserPlaylist, updatedPlaylist } };
  } catch (error) {
    console.error('Update UserPlaylist Error:', error);
    return { error: `An error occurred: ${error}` };
  }
};





export {
  addPlaylistToDB,
  checkPlaylistExistsByPlaylistId,
  addUserPlaylistEntry,
  getPlaylistsFormDB,
  getUserPlaylistByIDFromDB,
  getUserPlaylistsFromDB,
  deleteUserPlaylistFromDB,
  updateUserPlaylistData
};
