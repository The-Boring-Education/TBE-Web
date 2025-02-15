import React from "react";
import { PlaylistPageProps } from "@/interfaces";
import { SEO, PlaylistCantainerCard } from "@/components";
import { getPlaylistPageProps } from "@/utils";

const PlaylistPage = ({ playlist, seoMeta }: PlaylistPageProps) => {
  return (
    <>
      <SEO seoMeta={seoMeta} />
       <div className="w=full flex flex-col items-start"
       ></div>
        <PlaylistCantainerCard playlist={playlist} />
      

    </>
  );
};

export const getServerSideProps = getPlaylistPageProps;
export default PlaylistPage;
