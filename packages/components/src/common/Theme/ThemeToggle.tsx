"use client";

import type { ThemeToggleProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useHasThemeProvider } from "./ThemeContext";

const ThemeToggle = ({ className, theme: shellTheme }: ThemeToggleProps) => {
  const hasThemeProvider = useHasThemeProvider();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!hasThemeProvider) {
    return null;
  }

  const isDark = mounted && resolvedTheme === "dark";
  const isShellDark = shellTheme === "dark" || isDark;
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-analytics-id="theme-toggle"
      data-analytics-label={label}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center transition-opacity outline-none hover:opacity-70",
        isShellDark ? "text-white" : "text-black",
        className,
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
      ) : (
        <Moon aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
};

export default ThemeToggle;
