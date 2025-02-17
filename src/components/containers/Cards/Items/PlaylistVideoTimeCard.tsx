import React, { useState, useEffect } from "react";
import { PlaylistVideoTimeCardProps } from "@/interfaces"; 
import { routes } from '@/constant';
import { useRouter } from 'next/router';
import { convertSecondsToMinutes } from "@/utils"; 

const PlaylistVideoTimeCard = ({ usertime = 0, playlistId }: PlaylistVideoTimeCardProps) => {
  const router = useRouter();
  const [time, setTime] = useState(usertime * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTime(usertime * 60);
  }, [usertime]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const handleBackPage = (playlistId: string) => {
    const redirectUrl = `${routes.youfocusPlaylist}/${playlistId}`;
   window.location.href = redirectUrl;;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-sm p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <button
        className="w-10 h-10 flex items-center justify-center bg-gray-700 text-white rounded-full hover:bg-gray-600"
        onClick={() => handleBackPage(playlistId)}
      >
        <img className="w-5 h-5 p-1" src="/images/arrowback.svg" alt="Back" />
      </button>

      <div className="text-lg font-bold">{convertSecondsToMinutes(time)}</div>

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
