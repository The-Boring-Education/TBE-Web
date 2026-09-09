"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useHasThemeProvider } from "./ThemeContext";

/** Resolves the active color theme for page sections. Defaults to light. */
export const useColorTheme = (): "light" | "dark" => {
  const hasThemeProvider = useHasThemeProvider();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!hasThemeProvider || !mounted) {
    return "light";
  }

  return resolvedTheme === "dark" ? "dark" : "light";
};
