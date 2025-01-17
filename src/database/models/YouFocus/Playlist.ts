import { Schema, model, models, Model } from 'mongoose';
import { PlaylistModel, Video } from '@/interfaces';
import { databaseModels } from '@/constant';

const VideoSchema = new Schema<Video>(
  {
    title: { type: String, required: true },
    videoId: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { _id: false } // Disable the creation of _id for embedded documents
);


const PlaylistSchema = new Schema<PlaylistModel>(
  {
    playlistId: {
      type: String,
      required: [true, 'Playlist ID is required'],
    },
    playlistName: {
      type: String,
      required: [true, 'Playlist Name is required'],
    },
    description: {
      type: String,
    },
    referrerBy: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
    },
    videos: [VideoSchema],
  },
  { timestamps: true }
);

// Create or retrieve the model
const Playlist: Model<PlaylistModel> =
  models.Playlist || model<PlaylistModel>(databaseModels.PLAYLIST, PlaylistSchema);
export default Playlist;
