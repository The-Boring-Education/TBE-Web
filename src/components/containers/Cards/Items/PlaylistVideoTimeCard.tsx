import React, { useState, useEffect } from "react";
import { PlaylistVideoTimeCardProps } from "@/interfaces"; // ✅ Named import

const PlaylistVideoTimeCard = ({ usertime = 0 }: PlaylistVideoTimeCardProps) => {
  const [time, setTime] = useState(usertime * 60); // Convert minutes to seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTime(usertime * 60);
  }, [usertime]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-sm p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <button
        className="w-10 h-10 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-gray-600"
      >
        <img className="w-5 h-5 p-1" src="/images/arrowback.svg" alt="Back" />
      </button>

      <div className="text-lg font-bold">{formatTime(time)}</div>

      <button
        className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-700"
        onClick={() => setIsRunning(!isRunning)}
      >
        <img className="w-6 h-6 p-1" src={isRunning ? "/images/pause.svg" : "/images/play.svg"} alt={isRunning ? "Pause" : "Play"} />
      </button>
    </div>
  );
};

export default PlaylistVideoTimeCard;
