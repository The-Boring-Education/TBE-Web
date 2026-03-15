import { type QuestionResourcesModel } from "@tbe/interface";
import { useEffect, useRef, useState } from "react";
import { FaBook, FaYoutube } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

import Button from "../Buttons/Button";

export interface ResourceTooltipProps {
  resources?: QuestionResourcesModel;
  theme?: "light" | "dark";
  className?: string;
}

const ResourceTooltip = ({
  resources,
  theme = "dark",
  className = "",
}: ResourceTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  // Check if any resources exist
  const hasResources =
    resources?.youtubeURL || resources?.leetcodeURL || resources?.blogURL;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!hasResources) {
    return null;
  }

  const resourceItems = [
    {
      url: resources?.youtubeURL,
      icon: <FaYoutube className="w-3 h-3" />,
      label: "YouTube",
      color: "text-red-500",
    },
    {
      url: resources?.leetcodeURL,
      icon: <SiLeetcode className="w-3 h-3" />,
      label: "LeetCode",
      color: "text-amber-500",
    },
    {
      url: resources?.blogURL,
      icon: <FaBook className="w-3 h-3" />,
      label: "Blog",
      color: "text-blue-500",
    },
  ].filter((item) => item.url);

  const handleResourceClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown - Opens on TOP */}
      {isOpen && (
        <div
          className={`
            absolute bottom-full left-0 mb-1 z-50
            rounded shadow-md border
            ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
        >
          {resourceItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleResourceClick(item.url!)}
              className={`
                w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left whitespace-nowrap
                transition-colors duration-100 cursor-pointer
                ${index === 0 ? "rounded-t" : ""}
                ${index === resourceItems.length - 1 ? "rounded-b" : ""}
                ${
                  isDark
                    ? "text-gray-200 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <span className={item.color}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trigger Button - Using TBE Button Component (MEDIUM size to match other buttons) */}
      <Button
        variant="SECONDARY"
        size="MEDIUM"
        onClick={() => setIsOpen(!isOpen)}
        text="View Resources"
      />
    </div>
  );
};

export default ResourceTooltip;
