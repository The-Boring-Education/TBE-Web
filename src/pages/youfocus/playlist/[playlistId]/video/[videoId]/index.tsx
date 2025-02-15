
import React from "react";
import { getPlaylistPageProps } from "@/utils";
import Section from "@/components/layout/Section";

const PlaylistVideoPage = () => {
  return (
    <>
     
      <Section className="p-2">
       <h1> Hello </h1>
      </Section>

    </>
  );
};

export const getServerSideProps = getPlaylistPageProps;
export default PlaylistVideoPage;
