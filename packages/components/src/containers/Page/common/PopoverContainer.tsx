import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { PopoverContainerProps } from "@tbe/interface";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** How long (ms) to wait after mouse-leave before closing, so the cursor
 *  can travel from the trigger button down to the panel without flickering. */
const HOVER_CLOSE_DELAY_MS = 200;

const PopoverContainer = ({
  label,
  children,
  panelClasses,
  isOpen: propOpen,
  onToggle,
  theme,
}: PopoverContainerProps & { theme?: "light" | "dark" }) => {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Keep a ref that always holds the latest `open` value so that the
   * debounced close callback never reads a stale closure value.
   */
  const openRef = useRef(open);
  openRef.current = open;

  // ── Close when the route changes ────────────────────────────────────────
  useEffect(() => {
    if (pathname !== previousPathname.current && open) {
      onToggle();
    }
    previousPathname.current = pathname;
  }, [pathname, open, onToggle]);

  // ── Clear the timer when the component unmounts ──────────────────────────
  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    };
  }, []);

  // ── Hover helpers ────────────────────────────────────────────────────────
  const cancelClose = () => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleMouseEnter = () => {
    cancelClose();
    if (!openRef.current) onToggle(); // open only if currently closed
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      if (openRef.current) onToggle(); // close only if still open
    }, HOVER_CLOSE_DELAY_MS);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button — click also toggles */}
      <button
        type="button"
        className={`inline-flex items-center text-base outline-none ${theme === "dark"
            ? "text-white hover:text-white/80"
            : "text-black hover:text-primary"
          }`}
        onClick={onToggle}
      >
        <span>{label}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`h-3 w-3 ml-1 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
            }`}
        />
      </button>

      {/* Dropdown panel — CSS-driven transition, no Headless UI internal state */}
      <div
        className={`absolute z-10 mt-2 flex w-screen max-w-max -translate-x-1/2 transition-all duration-200 ease-out ${panelClasses} ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-1 pointer-events-none"
          }`}
      >
        <div className="overflow-hidden rounded-2 bg-white dark:bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-100/10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopoverContainer;
