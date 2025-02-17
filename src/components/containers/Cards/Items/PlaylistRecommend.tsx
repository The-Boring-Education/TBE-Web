import React, { useState } from "react";
import { Button, Text, SectionHeaderContainer } from "@/components";

const PlaylistRecommend = () => {
  const [copied, setCopied] = useState(false);

  const copyCurrentPageUrl = () => {
    const currentUrl = window.location.href; // Get current page URL
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        setCopied(true); // Show message
        setTimeout(() => setCopied(false), 2000); // Hide after 2s
      })
      .catch(err => console.error("Failed to copy URL:", err));
  };

  return (
    <div className="w-full max-w-md p-4 bg-white shadow-lg rounded-lg text-center relative">

      <SectionHeaderContainer
        heading='Recommend'
        focusText='Playlist'
        headingLevel={4}
        subtext='Share it With Your Friend and Learn Together'
      />

      <div className="mt-2 md:mt-4 flex justify-center gap-2">
        <Button
          variant='PRIMARY'
          className='="bg-red-500 text-nowrap text-white px-4 py-1 md:py-2 rounded-lg shadow-md hover:bg-red-600"'
          text='Recommend'
          onClick={""}
        />
        <Button
          variant='OUTLINE'
          className='="bg-red-500 text-nowrap px-4 py-1 md:py-2 rounded-lg shadow-md hover:bg-red-600"'
          text='Copy Link'
          onClick={copyCurrentPageUrl}
        />
      </div>

      {/* Show popup when copied */}
      {copied && (
        <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-3 py-1 rounded-md shadow-md">
          ✅ Playlist URL copied!
        </div>
      )}
    </div>
  );
};

export default PlaylistRecommend;
