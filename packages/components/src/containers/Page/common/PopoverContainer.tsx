import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import type { PopoverContainerProps } from "@tbe/interface";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef } from "react";

const PopoverContainer = ({
  label,
  children,
  panelClasses,
  isOpen: propOpen,
  onToggle,
  theme,
}: PopoverContainerProps & { theme?: "light" | "dark" }) => {
  const pathname = usePathname();
  const popoverButtonRef = useRef<HTMLButtonElement>(null);
  const previousPathname = useRef(pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Close popover when route changes (works with both Pages and App Router)
    if (pathname !== previousPathname.current && propOpen) {
      onToggle();
      previousPathname.current = pathname;
    }
  }, [pathname, propOpen, onToggle]);

  // Clear any pending close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleMouseEnter = () => {
    // Cancel any pending close so re-entering cancels the leave delay
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    // Open only if not already open
    if (!propOpen) {
      onToggle();
    }
  };

  const handleMouseLeave = () => {
    // Delay closing to allow cursor to travel from button to panel
    closeTimer.current = setTimeout(() => {
      if (propOpen) {
        onToggle();
      }
    }, 200);
  };

  return (
    <Popover className="relative">
      {/* Ignore headlessui's internal click-only open state — use propOpen (parent-controlled) instead */}
      {() => (
        <Fragment>
          {/* Hover wrapper covers both the trigger button and the dropdown panel */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <PopoverButton
              ref={popoverButtonRef}
              className={`inline-flex items-center text-base ${theme === "dark" ? "text-white hover:text-white/80" : "text-black hover:text-primary"} outline-none`}
              onClick={onToggle}
            >
              <span>{label}</span>
              <ChevronDownIcon aria-hidden="true" className="h-3 w-3 ml-1" />
            </PopoverButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
              show={propOpen}
            >
              <PopoverPanel
                className={`absolute z-10 mt-2 flex w-screen max-w-max -translate-x-1/2 ${panelClasses}`}
              >
                <div className="overflow-hidden rounded-2 bg-white dark:bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-100/10">
                  {children}
                </div>
              </PopoverPanel>
            </Transition>
          </div>
        </Fragment>
      )}
    </Popover>
  );
};

export default PopoverContainer;
