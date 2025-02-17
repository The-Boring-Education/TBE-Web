import React from "react";
import { Image, Text } from "@/components";
import { PlaylistVideoCardProps } from "@/interfaces";

const PlaylistVideoCard = ({ image, imageAltText, title, onClick }: PlaylistVideoCardProps) => {
  return (
    <div className="flex  flex-col md:items-center ">
    <div 
      className=" border-gray-900 md:w-3/4 mb-1 hover:bg-slate-200 rounded-lg cursor-pointer"
      onClick={onClick} // ✅ Call onClick when the card is clicked
    >
      <div className="w-full max-w-[90%] mx-auto flex flex-row">
        <div className="flex-1 w-[16rem] max-w-60 md:h-32 relative">
          <Image src={image} alt={imageAltText} className="object-cover w-full  rounded-md" />
        </div>
        <div className="flex-1 p-2">
          <Text level="h5" className="heading-5 font-primary  text-[1rem] md:text-[1.1rem] line-clamp-2">
            {title}
          </Text>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PlaylistVideoCard;
