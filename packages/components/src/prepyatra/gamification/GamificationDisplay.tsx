import { usePyGamification } from "@tbe/hooks";
import { useEffect, useRef, useState } from "react";

const GamificationDisplay = ({ userId }: { userId: string }) => {
  const {
    points,
    currentLevel,
    currentLevelName,
    nextLevelName,
    pointsNeededForNextLevel,
    percentageProgress,
    loading,
  } = usePyGamification(userId);

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (loading) {
    return null;
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        className="flex w-10 h-10 justify-center items-center rounded-full border-2 border-primary text-primary hover:text-white hover:bg-primary font-bold"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="w-full h-full flex text-xs items-center justify-center">
          {points}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-1/2 -translate-x-1/2">
          <div className="bg-white rounded-2xl shadow-lg border px-4 py-3 w-[280px]">
            <div className="flex items-center gap-3">
              {/* Progress Circle */}
              <div className="w-[70px] h-[70px] flex items-center justify-center flex-shrink-0">
                <svg width={70} height={70}>
                  <circle
                    cx={35}
                    cy={35}
                    r={30}
                    stroke="#e5e7eb"
                    strokeWidth={7}
                    fill="none"
                  />
                  <circle
                    cx={35}
                    cy={35}
                    r={30}
                    stroke="#ef4444"
                    strokeWidth={7}
                    fill="none"
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={
                      2 * Math.PI * 30 * (1 - percentageProgress / 100)
                    }
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dashoffset 0.4s ease",
                    }}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="15px"
                    fill="#ef4444"
                    fontWeight="bold"
                  >
                    {points}
                  </text>
                </svg>
              </div>

              {/* Info */}
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm text-gray-500 font-medium uppercase">
                  YOU'RE AT
                </span>
                <span className="text-base font-semibold text-primary leading-tight">
                  Level {currentLevel} : {currentLevelName}
                </span>
                {nextLevelName && (
                  <span className="mt-2 text-sm font-semibold text-black px-2.5 py-1 rounded-md bg-gradient-to-r from-pink-500 to-yellow-400 whitespace-nowrap">
                    {pointsNeededForNextLevel} to {nextLevelName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDisplay;
