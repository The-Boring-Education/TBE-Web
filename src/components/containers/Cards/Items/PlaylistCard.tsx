import React from "react";
import { Image, Text } from "@/components";
import { PlaylistCardProps } from "@/interfaces";

const PlaylistCard = ({ title, description, thumbnail, playlistVideo, videoId, route }: PlaylistCardProps) => {
  return (
    <div className="flex justify-center">
      <div className="w-full p-2 md:max-w-[70%] flex flex-col gap-4">
        
        {/* Video/Thumbnail Section */}
        <div className="w-full border-2 border-black rounded-md overflow-hidden transition-transform duration-300 hover:scale-105">
          {playlistVideo ? (
            <iframe
              className="w-full h-56 md:h-72 lg:h-96 rounded-md"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <Image
              className="w-full h-auto md:h-[20rem] lg:h-[25rem] object-cover shadow-lg rounded-lg"
              src={thumbnail}
              alt={title}
            />
          )}
        </div>

        {/* Text Section */}
        <div className="w-full text-center">
          <Text level="h2" className="font-bold text-lg md:text-xl lg:text-2xl">
            {title}
          </Text>
          <Text level="p" className="text-sm md:text-base lg:text-lg mt-1 pt-1 line-clamp-2">
            {description}
          </Text>
        </div>

        {/* Start Learning Button */}
        {!playlistVideo && (
          <div className="w-full max-w-[25rem] py-2 mx-auto">
            <LinkButton
              href={route || ""}
              className="w-full sm:w-fit"
              buttonProps={{
                variant: "PRIMARY",
                text: "Start Learning",
                className: "w-full",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;
