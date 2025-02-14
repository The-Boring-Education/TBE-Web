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

const updateUserPlaylistData = async (
  userId: string,
  playlistId: string,
  updateData: { isRecommended?: boolean; learningTime?: number } = {}
): Promise<DatabaseQueryResponseType> => {
  try {
    // Initialize update object with provided values
    const updateFields: any = {};

    if (updateData.isRecommended !== undefined) {
      updateFields.isRecommended = updateData.isRecommended;
    }
    if (updateData.learningTime !== undefined) {
      updateFields.learningTime = updateData.learningTime;
    }

    // If no valid updates, return an error
    if (Object.keys(updateFields).length === 0) {
      return { error: 'No valid updates provided' };
    }

    // Retrieve existing UserPlaylist document
    const existingUserPlaylist = await UserPlaylist.findOne({ userId, playlistId });

    if (!existingUserPlaylist) {
      return { error: 'UserPlaylist not found' };
    }

    // Check if `isRecommended` was previously false and is now being set to true
    const shouldIncrementReferrerBy =
      updateData.isRecommended === true && existingUserPlaylist.isRecommended === false;

    // Update UserPlaylist
    const userPlaylist = await UserPlaylist.findOneAndUpdate(
      { userId, playlistId },
      { $set: updateFields },
      { new: true }
    );

    if (!userPlaylist) {
      return { error: 'Failed to update UserPlaylist' };
    }

    // Increment referrerBy in Playlist only if transitioning from false to true
    let addreferrerinPlaylist = null;
    if (shouldIncrementReferrerBy) {
      addreferrerinPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $inc: { referrerBy: 1 } },
        { new: true, fields: { referrerBy: 1, _id: 0 } }
      );

      if (!addreferrerinPlaylist) {
        return { error: 'Playlist not found' };
      }
    }

    return { data: { userPlaylist, addreferrerinPlaylist } };
  } catch (error) {
    return { error: 'An error occurred while updating UserPlaylist' };
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
