import { Bars3Icon } from "@heroicons/react/24/outline";
import { TOP_NAVIGATION } from "@tbe/constants";
import { useTheme } from "@tbe/hooks";
import React from "react";

import { FlexContainer, Link, LinkButton } from "..";
import UserPointButton from "../common/Buttons/UserPointButton";
import { ThemeToggle } from "./Navbar";

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
  const { theme } = useTheme();

  return React.createElement(
    FlexContainer,
    {
      as: "header",
      className:
        "fixed top-0 left-0 right-0 h-[72px] z-40 bg-background border-b border-border shadow-md",
    },
    React.createElement(
      FlexContainer,
      {
        as: "nav",
        className:
          "relative flex items-center justify-between h-full px-[12px] lg:px-[32px] border-0",
      },
      <>
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
              className="flex items-center justify-center rounded-md p-[6px] text-foreground hover:bg-accent"
              type="button"
              onClick={onMenuToggle}
            >
              <Bars3Icon
                aria-hidden="true"
                className="h-[16px] w-[16px] text-foreground"
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
          <ThemeToggle />
          {showGamification && <UserPointButton />}
          {TOP_NAVIGATION?.issues?.[0]?.href && (
            <FlexContainer direction="col" itemCenter={false}>
              <Link
                className="text-base text-foreground hover:text-primary whitespace-nowrap"
                href={TOP_NAVIGATION.issues[0].href}
                target={TOP_NAVIGATION.issues[0]?.target}
              >
                {TOP_NAVIGATION.issues[0]?.name}
              </Link>
            </FlexContainer>
          )}
        </div>
      </>,
    ),
  );
};

export default LearningNavbar;
