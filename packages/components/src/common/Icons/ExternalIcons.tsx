import React from "react";
import { FaYoutube } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

export const LeetCodeIcon = ({
  className = "w-3 h-3",
}: {
  className?: string;
}) => {
  return <SiLeetcode className={`${className} text-[#FFA116]`} />;
};

export const YouTubeIcon = ({
  className = "w-3 h-3",
}: {
  className?: string;
}) => {
  return <FaYoutube className={`${className} text-[#FF0000]`} />;
};
