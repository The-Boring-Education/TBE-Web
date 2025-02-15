import React, { useState } from "react";
import {
  PlaylistVideoCard,
  PlaylistCard
} from "@/components";
import { CardContainerCProps, Video } from "@/interfaces";
import PlaylistVideoTimeCard from "./Items/PlaylistVideoTimeCard";
import PlaylistRecommend from "./Items/PlaylistRecommend";

const PlaylistContainerCard = ({ playlist }: CardContainerCProps) => {
  const playlistData = Array.isArray(playlist) ? playlist[0] : playlist;
  if (!playlistData?.playlistId) {
    console.error("Error: playlistId is missing in playlist data", playlistData);
    return <p>Error loading playlist.</p>;
  }

  const actualPlaylist = playlistData.playlistId;

  const [selectedVideoId, setSelectedVideoId] = useState(actualPlaylist.videos?.[0]?.videoId || "");
  const [selectedPlaylistName, setSelectedPlaylistName] = useState(actualPlaylist.playlistName || "Playlist");
  const [selectedThumbnail, setSelectedThumbnail] = useState(actualPlaylist.thumbnail || "");

  const [playlistVideo, setPlaylistVideo] = useState(false);
  const togglePlaylistVideo = () => {
    setPlaylistVideo((prev) => !prev);
  };
// console.log(playlistData);

  return (
    <div className=" w-full ">
      <div className=" flex justify-center p-2">
        {playlistVideo ? <PlaylistVideoTimeCard usertime={playlistData.learningTime} playlistId={actualPlaylist._id} /> : null}
      </div>
      <div className="flex flex-col md:items-center gap-2 md:gap-6 w-full md:max-w-[80%] mx-auto">
        <div  className=" md:max-w-[80%] md:border-4 md:rounded-md md:border-black">
        <div className="w-full">
          <PlaylistCard
            title={selectedPlaylistName}
            description={actualPlaylist.description}
            thumbnail={selectedThumbnail}
            playlistVideo={playlistVideo}
            videoId={selectedVideoId}
            route=""
            playlistVideoId={selectedVideoId}
          />

        </div>
        {!playlistVideo && (
          <div className="w-full px-2 max-w-[25rem] py-2 m-auto">
            <button
              className="w-full sm:w-[25rem] px-6 py-1 shadow-lg text-white bg-primary border-2 rounded-md border-primary hover:scale-105 transition-all flex items-center justify-center gap-2"
              onClick={togglePlaylistVideo}
            >
              Start Learning
            </button>
          </div>
        )}

        {playlistVideo ? (
          actualPlaylist.videos.map((video: Video) => (
            <PlaylistVideoCard
              key={video.videoId}
              title={video.title}
              image={video.thumbnail}
              imageAltText={video.title}
              onClick={() => {
                setSelectedVideoId(video.videoId);
                setSelectedThumbnail(video.thumbnail);
                setSelectedPlaylistName(video.title);
              }}
              playlistId={actualPlaylist.playlistId}
              videro={actualPlaylist.visero || []}
            />
          ))
        ) : (
          actualPlaylist.videos.map((video: Video) => (
            <PlaylistVideoCard
              key={video.videoId}
              title={video.title}
              image={video.thumbnail}
              imageAltText={video.title}
            />
          ))
        )}   
      </div>
      </div>
      <div className=" w-full px-2 flex justify-center items-center" >
          {playlistVideo ?
            <PlaylistRecommend />
            : null}
        </div>
    </div>

  );
};

export default PlaylistContainerCard;
