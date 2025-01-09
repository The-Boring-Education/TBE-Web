import { Schema, model, models, Model } from 'mongoose';
import {PlaylistModel,Video} from '@/interfaces';
import {databaseModels} from '@/constant';

const VideoSchema = new Schema<Video>(
  {
    title: { type: String, required: true },
    videoId: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { _id: false } // Disable the creation of _id for embedded documents
);

// Define the schema
const PlaylistSchema = new Schema<PlaylistModel>(
  {
    playlistUrl: {
      type: String,
      required: [true, 'Playlist URL is required'],
    },
    playlistName:{
      type: String,
      required: [true, 'Playlist Name is required'],
    },
    channelName: { 
      type: String,
      required: [true, 'Channel Name is required'],
      },
      description:{
        type: String,
      },
      videos: [VideoSchema],
  },
  { timestamps: true }
);

// Create or retrieve the model
const Playlist: Model<PlaylistModel> =
  models.Playlist || model<PlaylistModel>(databaseModels.PLAYLIST, PlaylistSchema);
export default Playlist;
