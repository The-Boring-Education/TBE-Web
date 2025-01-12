import { DatabaseQueryResponseType } from "@/interfaces";
import { Playlist } from "@/database";

const getPlaylistVideoByIdFromDB = async (
    playlistId: string
): Promise<DatabaseQueryResponseType> => {
  
    try {
        const playlist = await Playlist.findOne({ _id: playlistId });

        if (!playlist) {
            return { error: "Playlist not found" };
        }

        return { data: playlist };
        
    } catch (error) {
        return { error };
     }
    }

export {
    getPlaylistVideoByIdFromDB
}