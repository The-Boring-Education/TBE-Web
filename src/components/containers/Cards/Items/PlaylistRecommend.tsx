import React from "react";

const PlaylistRecommend = () => {
  return (
    <div className="w-full max-w-md p-4 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-lg font-bold text-gray-900">
        Recommend <span className="text-red-500">Playlist</span>
      </h2>
      <p className="text-gray-600 mt-1">Share it With Your Friend and Learn Together</p>
      <div className="mt-4 flex justify-center gap-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600">
          Recommend
        </button>
        <button className="border border-red-500 text-red-500 px-4 py-2 rounded-lg shadow-md hover:bg-red-100">
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default PlaylistRecommend;
