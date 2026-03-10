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
      <div className="bg-gray-300 rounded-full h-4">
        <div
          className="bg-success h-full rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <div className="text-sm mt-1">
        {completedChapters} / {totalChapters} Chapters Completed (
        {completionPercentage}%)
      </div>
    </div>
  );
};

export default LinerProgressBar;
