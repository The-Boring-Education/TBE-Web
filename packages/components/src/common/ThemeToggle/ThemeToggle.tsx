"use client";

import { useTheme } from "./ThemeProvider";

/**
 * A toggle button that switches between light and dark themes.
 * Displays a sun icon in dark mode (click to switch to light) and
 * a moon icon in light mode (click to switch to dark).
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      aria-label={
        resolvedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      type="button"
      onClick={toggleTheme}
    >
      {/* Sun icon – visible in dark mode */}
      <svg
        className="hidden h-5 w-5 text-yellow-400 dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Moon icon – visible in light mode */}
      <svg
        className="block h-5 w-5 text-gray-700 dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
