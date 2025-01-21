import { Schema, model, models, Model } from 'mongoose';
import { UserPlaylistModel } from '@/interfaces';
import { databaseModels } from '@/constant';

// Define UserPlaylist schema and model
const UserPlaylistSchema = new Schema<UserPlaylistModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.USER,
      required: [true, 'User ID is required'],
    },
    playlistId: {
      type: Schema.Types.ObjectId,
      ref: databaseModels.PLAYLIST,
      required: [true, 'Playlist ID is required'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserPlaylist: Model<UserPlaylistModel> =
  models.UserPlaylist ||
  model<UserPlaylistModel>(databaseModels.USER_PLAYLIST, UserPlaylistSchema);
export default UserPlaylist;
