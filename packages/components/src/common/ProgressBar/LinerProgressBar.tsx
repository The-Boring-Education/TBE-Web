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
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
        <span>
          {completedChapters} / {totalChapters} Chapters Completed
        </span>
        <span className="font-semibold text-primary">
          {completionPercentage}%
        </span>
      </div>
      <div className="bg-muted/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-primary bg-success h-full rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default LinerProgressBar;
