import type {
  DatabaseQueryResponseType,
  PlaylistModel,
} from "@/lib/interfaces";

import { Playlist, UserPlaylist } from "../models";

// Add a playlist to the database
const addPlaylistToDB = async (
  playlistDetails: PlaylistModel,
): Promise<DatabaseQueryResponseType> => {
  try {
    const playlist = new Playlist(playlistDetails);
    await playlist.save();
    return { data: playlist };
  } catch (error) {
    return { error: "Failed while adding playlist" };
  }
};

const updateTagsInPlaylist = async (
  playlistId: string,
  tags: string[],
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId },
      { $set: { tags } },
      { new: true },
    );

    return { data: updatedPlaylist };
  } catch (error) {
    return { error };
  }
};

const addUserPlaylistToDB = async (
  userId: string,
  playlistId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const existingUserPlaylist = await UserPlaylist.findOne({
      userId,
      playlistId,
    });

    if (existingUserPlaylist) {
      return { error: "UserPlaylist already exists" };
    }

    const userPlaylist = new UserPlaylist({
      userId,
      playlistId,
    });

    await userPlaylist.save();
    return { data: userPlaylist };
  } catch (error) {
    return { error };
  }
};

const updateReferredByInPlaylist = async (
  playlistId: string,
  increment: boolean,
): Promise<DatabaseQueryResponseType> => {
  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId },
      { $inc: { referrerBy: increment ? 1 : -1 } },
      { new: true },
    );

    if (!updatedPlaylist) {
      return { error: "Playlist not found" };
    }

    return { data: updatedPlaylist };
  } catch (error) {
    return { error: `An error occurred: ${error}` };
  }
};

const checkPlaylistExistsByID = async (
  playlistId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const platlist = await Playlist.findOne({ playlistId });

    if (!platlist) {
      return { error: "Playlist does not exist" };
    }

    return { data: platlist };
  } catch (error) {
    return { error };
  }
};

const getPlaylistsFromDB = async (): Promise<DatabaseQueryResponseType> => {
  try {
    const playlists = await Playlist.find();
    return { data: playlists };
  } catch (error) {
    return { error };
  }
};

const formatPlaylistResponse = (playlist: any, userData?: any) => {
  if (!playlist) return null;

  const formattedPlaylist = {
    _id: playlist._id,
    playlistId: playlist.playlistId,
    playlistName: playlist.playlistName,
    description: playlist.description,
    referrerBy: playlist.referrerBy,
    thumbnail: playlist.thumbnail,
    tags: playlist.tags,
    videos: playlist.videos,
  };

  if (userData) {
    return {
      ...formattedPlaylist,
      userId: userData.userId,
      isRecommended: userData.isRecommended,
      learningTime: userData.learningTime,
    };
  }

  return formattedPlaylist;
};

const getPlaylistByIdFromDB = async (
  playlistId: string,
  userId?: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    let result: any;

    if (userId) {
      let userPlaylist = await UserPlaylist.findOne({
        playlistId,
        userId,
      })
        .populate("playlistId")
        .lean()
        .exec();

      if (!userPlaylist) {
        await addUserPlaylistToDB(userId, playlistId);
        userPlaylist = await UserPlaylist.findOne({
          playlistId,
          userId,
        })
          .populate("playlistId")
          .lean()
          .exec();
      }

      result = formatPlaylistResponse(userPlaylist?.playlistId, userPlaylist);
    } else {
      const playlist = await Playlist.findById(playlistId).lean();
      if (!playlist) return { error: "Playlist not found" };

      result = formatPlaylistResponse(playlist);
    }

    return { data: result };
  } catch (error) {
    return { error };
  }
};

const getUserPlaylistsFromDB = async (
  userId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylists = await UserPlaylist.find({ userId })
      .populate("playlistId")
      .lean()
      .exec()
      .then(
        (data) => data.filter((item) => item.playlistId), // If Playlist ID doesn't exist -> Skip
      );

    if (!userPlaylists.length) {
      return { error: "User does not have any playlists" };
    }

    const playlists = userPlaylists.map((userPlaylist) =>
      formatPlaylistResponse(userPlaylist.playlistId, userPlaylist),
    );

    return { data: playlists };
  } catch (error) {
    return { error: "An error occurred while fetching playlists" };
  }
};

// Delete a userPlaylist form DB
const deleteUserPlaylistFromDB = async (
  userId: string,
  playlistId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylist = await UserPlaylist.findOneAndDelete({
      userId,
      playlistId,
    });
    if (!userPlaylist) {
      return { error: "UserPlaylist not found" };
    }
    return { data: userPlaylist };
  } catch (error) {
    return { error: "An error occurred while deleting userPlaylist" };
  }
};

const updateUserPlaylistData = async (
  userId: string,
  playlistId: string,
  isRecommended?: boolean,
  learningTime?: number,
): Promise<DatabaseQueryResponseType> => {
  try {
    const userPlaylist = await UserPlaylist.findOne({ userId, playlistId });

    if (!userPlaylist) return { error: "UserPlaylist not found" };

    const updateFields: Record<string, any> = {};
    if (isRecommended !== undefined) updateFields.isRecommended = isRecommended;
    if (learningTime !== undefined) updateFields.learningTime = learningTime;

    if (Object.keys(updateFields).length === 0) {
      return { error: "No fields provided for update" };
    }

    const updatedUserPlaylist = await UserPlaylist.findOneAndUpdate(
      { userId, playlistId },
      { $set: updateFields },
      { new: true },
    );

    if (!updatedUserPlaylist) return { error: "Failed to update UserPlaylist" };

    let updatedPlaylist: DatabaseQueryResponseType | null = null;
    if (
      isRecommended !== undefined &&
      userPlaylist.isRecommended !== isRecommended
    ) {
      updatedPlaylist = await updateReferredByInPlaylist(
        playlistId,
        isRecommended,
      );
    }
    return { data: { updatedUserPlaylist, updatedPlaylist } };
  } catch (error) {
    return { error: `An error occurred: ${error}` };
  }
};

const getPlaylistByTagFromDB = async (
  tags: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const playlists = await Playlist.find({ tags: { $in: [tags] } });

    if (!playlists || playlists.length === 0) {
      return { error: "No playlists found for the given skill." };
    }

    return { data: playlists };
  } catch (error) {
    return { error };
  }
};

const deletePlaylistFromDB = async (
  playlistsId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: playlistsId });

    if (!playlist) {
      return { error: "Playlist does not exist" };
    }

    return { data: playlist };
  } catch (error) {
    return { error };
  }
};

const deletePlaylistByTagFromDB = async (
  tag: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const playlists = await Playlist.deleteMany({ tags: tag });

    if (!playlists) {
      return { error: "No playlists found for the given skill." };
    }
    return {
      data: playlists,
    };
  } catch (error) {
    return { error };
  }
};

export {
  addPlaylistToDB,
  addUserPlaylistToDB,
  checkPlaylistExistsByID,
  deletePlaylistByTagFromDB,
  deletePlaylistFromDB,
  deleteUserPlaylistFromDB,
  getPlaylistByIdFromDB,
  getPlaylistByTagFromDB,
  getPlaylistsFromDB,
  getUserPlaylistsFromDB,
  updateReferredByInPlaylist,
  updateTagsInPlaylist,
  updateUserPlaylistData,
};
