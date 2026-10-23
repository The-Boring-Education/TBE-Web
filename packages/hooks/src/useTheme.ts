import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const applyDomTheme = (resolved: ResolvedTheme) => {
  if (typeof document === "undefined") return;
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      const initialTheme: Theme =
        stored === "dark" || stored === "light" || stored === "system"
          ? stored
          : "system";

      const resolved =
        initialTheme === "system" ? getSystemTheme() : initialTheme;

      setThemeState(initialTheme);
      setResolvedTheme(resolved);
      applyDomTheme(resolved);
    } catch {
      /* ignore storage access error */
    }
  }, []);

  // Listen for OS theme changes when in "system" mode
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const newResolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        applyDomTheme(newResolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mounted, theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;

    setThemeState(newTheme);
    setResolvedTheme(resolved);
    applyDomTheme(resolved);

    try {
      localStorage.setItem("theme", newTheme);
      window.dispatchEvent(
        new CustomEvent("tbe-theme-change", { detail: newTheme }),
      );
    } catch {
      /* ignore storage access error */
    }
  }, []);

  const cycleTheme = useCallback(() => {
    const cycleMap: Record<Theme, Theme> = {
      light: "dark",
      dark: "system",
      system: "light",
    };
    setTheme(cycleMap[theme]);
  }, [setTheme, theme]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [setTheme, resolvedTheme]);

  // Sync state across multiple components/tabs
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent?.detail) {
        const next = customEvent.detail;
        const resolved = next === "system" ? getSystemTheme() : next;
        setThemeState(next);
        setResolvedTheme(resolved);
        applyDomTheme(resolved);
      }
    };
    window.addEventListener("tbe-theme-change", handleSync);
    return () => window.removeEventListener("tbe-theme-change", handleSync);
  }, []);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setTheme,
    cycleTheme,
    toggleTheme,
    mounted,
  };
};

export default useTheme;
