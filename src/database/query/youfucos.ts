import { DatabaseQueryResponseType } from "@/interfaces";
import { Playlist } from "@/database";

const getPlaylistByIdFromDB = async (
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

const getAllPlaylistdata = async (
): Promise<DatabaseQueryResponseType> => {

    try {
        const playlist = await Playlist.find({});

        if (!playlist) {
            return { error: "Playlist not found" };
        }

        return { data: playlist };

    } catch (error) {
        return { error };
    }
}

const checkPlaylistExistsByPlaylistId = async (
    playlistId: string
): Promise<DatabaseQueryResponseType> => {
    try {
        console.log(playlistId);
        
        // Check if the playlist exists
        const playlist = await Playlist.findOne({ playlistId : playlistId });
        
        if (playlist) {
            return { exists: true, message: "Playlist already exists in the database" };
        }
        
        return { exists: false, message: "Playlist does not exist in the database" };
    } catch (error) {
       
        console.error("Error checking playlist existence:", error);
        return { error: "An error occurred while checking the playlist existence" };
    }
};




export {
    getPlaylistByIdFromDB,
    getAllPlaylistdata,
    checkPlaylistExistsByPlaylistId
}