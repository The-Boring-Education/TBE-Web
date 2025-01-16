import { Schema, model, models, Model } from 'mongoose';
import type { UserPlaylistModel } from '@/interfaces';
import { databaseModels } from '@/constant';

const UserPlaylistSchema = new Schema<UserPlaylistModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: databaseModels.USER,
            required: true,
        },
        playlistId: {
            type: Schema.Types.ObjectId,
            ref: databaseModels.PLAYLIST,
            required: true,
        },
    },
    { timestamps: true }
);

export const UserPlaylist: Model<UserPlaylistModel> =
models.UserPlaylist || model<UserPlaylistModel>(databaseModels.USER_PLAYLIST, UserPlaylistSchema);

export default UserPlaylist;
