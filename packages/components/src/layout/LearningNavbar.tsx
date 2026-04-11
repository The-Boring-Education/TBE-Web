import { Bars3Icon } from "@heroicons/react/24/outline";
import { TOP_NAVIGATION } from "@tbe/constants";

import { FlexContainer, Link, LinkButton } from "..";
import UserPointButton from "../common/Buttons/UserPointButton";

export interface LearningNavbarProps {
  backHref: string;
  onMenuToggle?: () => void;
  headerCenterContent?: React.ReactNode;
  showGamification?: boolean;
}

const LearningNavbar = ({
  backHref,
  onMenuToggle,
  headerCenterContent,
  showGamification = false,
}: LearningNavbarProps) => {
  const theme = "dark";

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] z-40 bg-black shadow-md shadow-white/5 dark:shadow-[0_1px_15px_rgba(255,255,255,0.1)]">
      <nav className="relative flex items-center justify-between h-full px-[12px] lg:px-[32px] border-0">
        {/* Left Section */}
        <div className="flex items-center">
          <LinkButton
            href={backHref}
            buttonProps={{
              variant: "OUTLINE",
              size: "SMALL",
              text: "← Back",
              className:
                "border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 py-[4px] px-[8px] h-auto whitespace-nowrap",
            }}
          />

          {onMenuToggle && (
            <button
              className={`flex items-center justify-center rounded-md p-[6px] ${theme === "dark" ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-100"}`}
              type="button"
              onClick={onMenuToggle}
            >
              <Bars3Icon
                aria-hidden="true"
                className={`h-[16px] w-[16px] ${theme === "dark" ? "text-white" : "text-black"}`}
              />
            </button>
          )}
        </div>

        {/* Center Section - Absolutely positioned for true centering */}
        {headerCenterContent && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-full px-4 min-w-0">
            {headerCenterContent}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-[16px] min-w-0">
          {showGamification && <UserPointButton />}
          {TOP_NAVIGATION?.issues?.[0]?.href && (
            <FlexContainer direction="col" itemCenter={false}>
              <Link
                className={`text-base ${theme === "dark" ? "text-white" : "text-black"} hover:text-primary whitespace-nowrap`}
                href={TOP_NAVIGATION.issues[0].href}
                target={TOP_NAVIGATION.issues[0]?.target}
              >
                {TOP_NAVIGATION.issues[0]?.name}
              </Link>
            </FlexContainer>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LearningNavbar;
