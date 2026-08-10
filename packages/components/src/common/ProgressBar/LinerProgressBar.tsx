import type { LinerProgressBarProps } from "@tbe/interface";

const LinerProgressBar = ({
  totalChapters,
  completedChapters,
}: LinerProgressBarProps) => {
  const completionPercentage =
    totalChapters > 0
      ? Math.floor((completedChapters / totalChapters) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>
          {completedChapters} / {totalChapters} Chapters
        </span>
        <span className="font-semibold text-success">{completionPercentage}%</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-success h-full rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default LinerProgressBar;
