import { Schema, model, models, Model } from 'mongoose';
import {PlaylistModel} from '@/interfaces';

// Define the schema
const PlaylistSchema = new Schema<PlaylistModel>(
  {
    playlistUrl: {
      type: String,
      required: [true, 'Playlist URL is required'],
    },
    videos: [
      {
        title: String,
        videoId: String,
        thumbnail: String,
      },
    ],
  },
  { timestamps: true }
);

// Create or retrieve the model
const Playlist: Model<PlaylistModel> =
  models.Playlist || model<PlaylistModel>('Playlist', PlaylistSchema);

export default Playlist;
