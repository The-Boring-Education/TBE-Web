import { XMarkIcon } from "@heroicons/react/24/outline";
import type { LearningSidebarPanelProps } from "@tbe/interface";

import LinerProgressBar from "../ProgressBar/LinerProgressBar";
import Text from "../Typography/Text";

const LearningSidebarPanel = ({
  title,
  totalItems,
  completedItems,
  children,
  theme = "dark",
  onClose,
}: LearningSidebarPanelProps) => {
  const isDark = theme === "dark";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Text
          level="h3"
          className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </Text>
        {onClose && (
          <button
            className={`rounded-md p-1 ${
              isDark
                ? "text-white hover:bg-gray-900"
                : "text-black hover:bg-gray-100"
            }`}
            onClick={onClose}
            type="button"
          >
            <XMarkIcon className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
      <LinerProgressBar
        totalChapters={totalItems}
        completedChapters={completedItems}
      />
      <div className="max-h-[70vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
};

export default LearningSidebarPanel;
