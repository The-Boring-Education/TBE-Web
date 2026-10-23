import type { ThemeToggleButtonProps } from "@tbe/interface";
import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeOption = "light" | "dark" | "system";

const applyDomTheme = (theme: ThemeOption) => {
  if (typeof document === "undefined") return;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const ThemeToggleButton = ({
  className = "",
  theme: controlledTheme,
  onToggle: controlledOnToggle,
  showLabel = false,
}: ThemeToggleButtonProps) => {
  const [internalTheme, setInternalTheme] = useState<ThemeOption>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") as ThemeOption | null;
      const initial: ThemeOption =
        stored === "dark" || stored === "light" || stored === "system"
          ? stored
          : "system";
      setInternalTheme(initial);
      applyDomTheme(initial);
    } catch {
      /* ignore storage access error */
    }
  }, []);

  const activeTheme = (controlledTheme as ThemeOption) ?? internalTheme;

  const handleToggle = () => {
    if (controlledOnToggle) {
      controlledOnToggle();
      return;
    }

    const cycleOrder: Record<ThemeOption, ThemeOption> = {
      light: "dark",
      dark: "system",
      system: "light",
    };

    const nextTheme = cycleOrder[activeTheme] || "light";
    setInternalTheme(nextTheme);

    try {
      localStorage.setItem("theme", nextTheme);
      applyDomTheme(nextTheme);
      window.dispatchEvent(
        new CustomEvent("tbe-theme-change", { detail: nextTheme }),
      );
    } catch {
      /* ignore storage access error */
    }
  };

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeOption>;
      if (customEvent?.detail) {
        setInternalTheme(customEvent.detail);
        applyDomTheme(customEvent.detail);
      }
    };
    window.addEventListener("tbe-theme-change", handleSync);
    return () => window.removeEventListener("tbe-theme-change", handleSync);
  }, []);

  const getThemeInfo = () => {
    if (activeTheme === "light") {
      return {
        label: "Light",
        next: "Dark",
        icon: (
          <Sun className="w-4 h-4 text-amber-500 animate-in fade-in duration-200" />
        ),
      };
    }
    if (activeTheme === "dark") {
      return {
        label: "Dark",
        next: "System",
        icon: (
          <Moon className="w-4 h-4 text-blue-400 animate-in fade-in duration-200" />
        ),
      };
    }
    return {
      label: "System",
      next: "Light",
      icon: (
        <Laptop className="w-4 h-4 text-muted-foreground animate-in fade-in duration-200" />
      ),
    };
  };

  const { label, next, icon } = getThemeInfo();

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Theme: ${label} (Click to switch to ${next})`}
      title={`Theme: ${label} (Click to switch to ${next})`}
      className={`inline-flex items-center justify-center gap-1.5 p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${className}`}
    >
      {mounted ? icon : <span className="w-4 h-4 opacity-0" />}
      {showLabel && (
        <span className="text-xs font-medium">{mounted ? label : "Theme"}</span>
      )}
    </button>
  );
};

export default ThemeToggleButton;
