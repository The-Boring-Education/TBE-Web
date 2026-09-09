import { Bars3Icon } from "@heroicons/react/24/outline";
import { TOP_NAVIGATION } from "@tbe/constants";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { FlexContainer, Link, LinkButton, ThemeToggle } from "..";
import UserPointButton from "../common/Buttons/UserPointButton";
import { useHasThemeProvider } from "../common/Theme";

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
  const hasThemeProvider = useHasThemeProvider();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Without a provider, keep the previous dark learning chrome.
  const shellIsDark = hasThemeProvider
    ? mounted && resolvedTheme === "dark"
    : true;

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-[72px] z-40 shadow-md shadow-white/5 ${
        shellIsDark
          ? "bg-black text-white"
          : "bg-white text-black border-b border-border"
      }`}
    >
      <nav className="relative flex items-center justify-between h-full px-[12px] lg:px-[32px] border-0">
        <div className="flex items-center">
          <LinkButton
            href={backHref}
            buttonProps={{
              variant: "OUTLINE",
              size: "SMALL",
              text: "← Back",
              className: shellIsDark
                ? "border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 py-[4px] px-[8px] h-auto whitespace-nowrap"
                : "border-gray-300 bg-transparent hover:border-primary hover:bg-primary/10 py-[4px] px-[8px] h-auto whitespace-nowrap",
            }}
          />

          {onMenuToggle && (
            <button
              className={`flex items-center justify-center rounded-md p-[6px] ${
                shellIsDark
                  ? "text-white hover:bg-gray-800"
                  : "text-black hover:bg-gray-100"
              }`}
              type="button"
              aria-label="Open learning menu"
              onClick={onMenuToggle}
            >
              <Bars3Icon
                aria-hidden="true"
                className={`h-[16px] w-[16px] ${shellIsDark ? "text-white" : "text-black"}`}
              />
            </button>
          )}
        </div>

        {headerCenterContent && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-full px-4 min-w-0">
            {headerCenterContent}
          </div>
        )}

        <div className="flex items-center gap-[16px] min-w-0">
          {hasThemeProvider && (
            <ThemeToggle theme={shellIsDark ? "dark" : "light"} />
          )}
          {showGamification && <UserPointButton />}
          {TOP_NAVIGATION?.issues?.[0]?.href && (
            <FlexContainer direction="col" itemCenter={false}>
              <Link
                className={`text-base ${shellIsDark ? "text-white" : "text-black"} hover:text-primary whitespace-nowrap`}
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
