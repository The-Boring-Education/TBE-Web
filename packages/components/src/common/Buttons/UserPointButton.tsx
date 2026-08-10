import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { UserLevelProgressContainer } from "@tbe/components";
import { useGamification, useGamificationContext } from "@tbe/gamification";
import { useUser } from "@tbe/hooks";
import { Flame } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

const UserPointButton = () => {
  const [isClient, setIsClient] = useState(false);
  const { isAuth, loading } = useUser();
  const { theme } = useGamificationContext();
  const {
    points,
    currentLevel,
    currentLevelName,
    nextLevelName,
    pointsLeftToNextLevel,
    percentageProgress,
  } = useGamification();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isAuth || loading) return null;

  const isDark = theme === "dark";

  return (
    <Popover className="relative">
      {/* ── Trigger pill: 🔥 + points ── */}
      <PopoverButton
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full
          font-semibold text-sm outline-none
          transition-all duration-200 select-none
          ${
            isDark
              ? "bg-primary/20 border border-primary/30 text-white hover:bg-primary/30 hover:border-primary/50"
              : "bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 hover:border-primary/40"
          }
        `}
        aria-label={`${points} points`}
      >
        <Flame
          size={15}
          className={isDark ? "text-primary" : "text-primary"}
          aria-hidden="true"
        />
        <span className={isDark ? "text-white" : "text-primary"}>
          {loading ? "…" : points}
        </span>
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-1 scale-95"
      >
        <PopoverPanel className="absolute z-50 mt-2 flex w-screen max-w-max right-0">
          <UserLevelProgressContainer
            currentLevel={currentLevel}
            currentLevelName={currentLevelName}
            nextLevelName={nextLevelName}
            percentageProgress={percentageProgress}
            points={points}
            pointsLeftToNextLevel={pointsLeftToNextLevel}
            theme={theme}
          />
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default UserPointButton;
