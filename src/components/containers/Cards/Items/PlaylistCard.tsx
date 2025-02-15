import React from "react";
import { Image, Text } from "@/components";
import { PlaylistCardProps } from "@/interfaces";



const PlaylistCard = ({ title, description, thumbnail, playlistVideo, videoId }: PlaylistCardProps) => {
  return (
        <div className="flex justify-center">
          <div className="w-full  p-2 md:max-w-[70%] flex flex-col gap-4">
            
            {/* Video/Thumbnail Section */}
            <div className="w-full border-2  border-black rounded-md overflow-hidden">
              {playlistVideo ? (
                <iframe
                  className="w-full h-56 md:h-72 lg:h-96"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <Image
                  src={thumbnail || "/placeholder.jpg"} // Fallback image
                  alt="Playlist Thumbnail"
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
    
            {/* Text Section */}
            <div className="w-full ">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold">{title}</h2>
              <p className="mt-1 text-sm md:text-base lg:text-lg line-clamp-2">
                {description}
              </p>
            </div>
    
          </div>
        </div>
      );
    };
  

export default PlaylistCard;
