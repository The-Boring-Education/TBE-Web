import React, { useState } from "react";
import {
  PlaylistVideoCard,
  PlaylistCard
} from "@/components";
import { CardContainerCProps, Video } from "@/interfaces";
import PlaylistVideoTimeCard from "./Items/PlaylistVideoTimeCard";
import PlaylistRecommend from "./Items/PlaylistRecommend";
import {Button} from '@/components';

const PlaylistContainerCard = ({ playlist }: CardContainerCProps) => {
  const playlistData = Array.isArray(playlist) ? playlist[0] : playlist;
  if (!playlistData?.playlistId) {
    console.error("Error: playlistId is missing in playlist data", playlistData);
    return <p>Error loading playlist.</p>;
  }

  const actualPlaylist = playlistData.playlistId;

  const [selectedVideo, setSelectedVideo] = useState({
    id: actualPlaylist.videos?.[0]?.videoId || "",
    name: actualPlaylist.playlistName || "Playlist",
    thumbnail: actualPlaylist.thumbnail || ""
  });

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
            title={selectedVideo.name}
            description={actualPlaylist.description}
            thumbnail={selectedVideo.thumbnail}
            playlistVideo={playlistVideo}
            videoId={selectedVideo.id}
            route=""
            playlistVideoId={selectedVideo.id}
          />

        </div>
        {!playlistVideo && (
          <div className="w-full px-2 max-w-[25rem] py-2 m-auto">
             <Button
              variant='PRIMARY'
              className='w-full sm:w-[25rem] px-6 py-1 shadow-lg text-white border-2 rounded-md border-primary hover:scale-105 transition-all flex items-center justify-center gap-2'
              text=' Start Learning'
              onClick={togglePlaylistVideo}
            />
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
                setSelectedVideo({
                  id: video.videoId,
                  name: video.title,
                  thumbnail: video.thumbnail
                });
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
