import { Button } from "@headlessui/react";
import type { StarButtonProps } from "@tbe/interface";
import { FaStar } from "react-icons/fa";

const StarButton = ({
  isStarred,
  onToggle,
  isLoading,
  className = "",
}: StarButtonProps) => (
  <Button
    className={`h-12 px-6 py-2 rounded-md text-base font-bold border flex items-center justify-center shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${
      isStarred
        ? "bg-yellow-100 border-yellow-400 text-yellow-700"
        : "bg-white border-gray-300 text-gray-400"
    } ${className}`}
    onClick={onToggle}
    disabled={isLoading}
    type="button"
  >
    <FaStar className={`${isStarred ? "text-yellow-500" : "text-gray-400"}`} />
  </Button>
);

export default StarButton;
