import React, { useState } from "react";
import { 
  Section,
  PlaylistVideoCard,
  PlaylistCard,
  PlaylistVideoTimeCard,
} from "@/components";
import { CardContainerCProps, Video } from "@/interfaces"; // Ensure Video type is imported
import PlaylistRecommend from "./Items/PlaylistRecommend";

const CardContainerC = ({ playlist }: CardContainerCProps) => {
  // Ensure playlist is an array and extract the first item
  const playlistData = Array.isArray(playlist) ? playlist[0] : playlist;
  console.log(playlistData.playlistId);
  
  // Check if playlistId exists
  if (!playlistData?.playlistId) {
    console.error("Error: playlistId is missing in playlist data", playlistData);
    return <p>Error loading playlist.</p>;
  }

  // Extract actual playlist object
  const actualPlaylist = playlistData.playlistId;

  const [playlistVideo, setPlaylistVideo] = useState(false);
  const togglePlaylistVideo = () => {
    // if (status === "loading") return; 
    // if (!session) {
    //   router.push('/');
    //   return;
    // }
    setPlaylistVideo((prev) => !prev);
  };
  return (
    <Section className="py-2 md:px-0">
      <div className="flex flex-col gap-6 max-w-full md:max-w-[90%] mx-auto">
      {playlistVideo && (
          <div className="w-full flex justify-center">
            <PlaylistVideoTimeCard usertime={0} />
          </div>
        )}
        <div className="w-full">
          <PlaylistCard
            title={actualPlaylist.playlistName}
            description={actualPlaylist.description}
            thumbnail={actualPlaylist.thumbnail}
            playlistVideoId={playlistVideo}                        
            videoId={actualPlaylist.videos?.[0]?.videoId}
            route=""
          />
        </div>

        {!playlistVideo && (
          <div className="w-full max-w-[25rem] py-2 m-auto">
            <button
              className="w-full sm:w-[25rem] px-6 py-1 shadow-lg text-white bg-primary border-2 rounded-md border-primary hover:scale-105 transition-all flex items-center justify-center gap-2"
              onClick={togglePlaylistVideo}
            >
              Start Learning
            </button>
          </div>
        )}

        {/* Ensure videos exist before mapping */}
        {actualPlaylist.videos?.length > 0 ? (
          actualPlaylist.videos.map((video: Video) => ( // ✅ Explicitly typing 'video'
            <PlaylistVideoCard
              key={video.videoId}
              title={video.title}
              image={video.thumbnail}
              imageAltText={video.title}
              content=""
              href={playlistVideo ? video.videoId : undefined}
            />
          ))
        ) : (
          <p>No videos available.</p>
        )}
      </div>
      {playlistVideo && (
        <div className="w-full flex justify-center">
          <PlaylistRecommend/>
        </div>
      )}
    </Section>
  );
};

export default CardContainerC;
