import { cn } from "@tbe/utils";
import Link from "next/link";
import { useRouter } from "next/router";

import { DSA_DASHBOARD_NAV_ITEMS } from "@/config/dsaDashboardNavItems";

export function MobileNav() {
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      aria-label="Mobile navigation"
    >
      {/* Frosted glass backdrop */}
      <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-2xl border-t border-[#1e1e1e]" />

      <div className="relative flex items-center justify-around h-[60px] px-1 safe-area-inset-bottom">
        {DSA_DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard#overall-progress"
              ? router.pathname === "/dashboard" &&
                router.asPath.includes("overall-progress")
              : router.pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 transition-all active:scale-95 duration-200",
                isActive ? "text-[#ff5757]" : "text-[#555]",
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-9 h-7 rounded-xl transition-all duration-200",
                )}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] transition-all duration-200",
                    isActive
                      ? "text-[#ff5757] drop-shadow-[0_0_10px_rgba(255,87,87,0.65)]"
                      : "text-[#555]",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide leading-none",
                  isActive ? "text-[#ff5757]" : "text-[#444]",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
