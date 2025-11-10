import { type Model, model, models, Schema } from 'mongoose';

import { DATABASE_MODELS } from '@/lib/constants';
import type { UserPlaylistModel } from '@/lib/interfaces';

// Define UserPlaylist schema and model
const UserPlaylistSchema = new Schema<UserPlaylistModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.USER,
      required: [true, 'User ID is required'],
    },
    playlistId: {
      type: Schema.Types.ObjectId,
      ref: DATABASE_MODELS.PLAYLIST,
      required: [true, 'Playlist ID is required'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    learningTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserPlaylistSchema.virtual('Playlist', {
  ref: DATABASE_MODELS.PLAYLIST,
  localField: 'playlistId',
  foreignField: '_id',
  justOne: true,
});

const UserPlaylist: Model<UserPlaylistModel> =
  models.UserPlaylist ||
  model<UserPlaylistModel>(DATABASE_MODELS.USER_PLAYLIST, UserPlaylistSchema);
export default UserPlaylist;
