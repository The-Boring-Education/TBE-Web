import React, { useState } from "react";

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
      <h2 className="text-lg font-bold text-gray-900">
        Recommend <span className="text-red-500">Playlist</span>
      </h2>
      <p className="text-gray-600 mt-1">Share it With Your Friend and Learn Together</p>
      <div className="mt-2 md:mt-4 flex justify-center gap-2">
        <button className="bg-red-500 text-nowrap text-white px-4 py-1 md:py-2 rounded-lg shadow-md hover:bg-red-600">
          Recommend
        </button>
        <button
          onClick={copyCurrentPageUrl}
          className="border text-nowrap border-red-500 text-red-500 px-4 py-1 md:py-2 rounded-lg shadow-md hover:bg-red-100"
        >
          Copy Link
        </button>
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
