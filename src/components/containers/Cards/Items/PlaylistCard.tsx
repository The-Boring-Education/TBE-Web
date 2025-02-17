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
          <Text level="h2" className="heading-5 font-primary  line-clamp-2">
            {title}
          </Text>
          <Text level="p" className=" font-primary  line-clamp-2">
            {description}
          </Text>
        </div>

      </div>
    </div>
  );
};


export default PlaylistCard;
