import { FlexContainer, Image, Text } from "@tbe/components";
import { routes } from "@tbe/constants";
import type { PlaylistSkillCardProps } from "@tbe/interface";
import { useRouter } from "next/navigation";
import React from "react";

const SkillCard = ({
  thumbnail,
  playlistName,
  referrerBy,
  noOfVideos,
  _id,
}: PlaylistSkillCardProps) => {
  const router = useRouter();

  return (
    <FlexContainer className="rounded-md hover:scale-105 transition-transform duration-300 md:w-fit w-full relative border border-black p-[6px]">
      <div
        className="cursor-pointer relative md:w-fit w-full"
        onClick={() => router.push(`${routes.youfocusPlaylistPageById(_id)}`)}
      >
        <Image
          alt={playlistName}
          className="w-full object-cover rounded-md"
          src={thumbnail}
        />

        {referrerBy > 0 && (
          <div className="absolute bottom-2 left-2 bg-white text-primary shadow-md px-1 md:px-3 py-1 rounded-full flex items-center justify-center">
            <Text className="text-xs font-semibold text-center" level="p">
              {referrerBy} Learners Suggested
            </Text>
          </div>
        )}

        {noOfVideos > 0 && (
          <div className="absolute bottom-2 right-2 bg-primary text-white shadow-md px-1 md:px-3 py-1 rounded-full flex items-center justify-center">
            <Text className="text-xs font-semibold text-center" level="p">
              {noOfVideos} Videos
            </Text>
          </div>
        )}
      </div>
    </FlexContainer>
  );
};

export default SkillCard;
