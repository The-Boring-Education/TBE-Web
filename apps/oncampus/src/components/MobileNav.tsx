import { cn } from "@tbe/utils";
import Link from "next/link";
import { useRouter } from "next/router";

import { ONCAMPUS_DASHBOARD_NAV_ITEMS } from "@/config/oncampusDashboardNavItems";

export function MobileNav() {
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      aria-label="Mobile navigation"
    >
      {/* Frosted glass backdrop */}
      <div className="absolute inset-0 bg-white/90 dark:bg-[#080808]/95 backdrop-blur-2xl border-t border-slate-200/90 dark:border-[#1e1e1e] shadow-lg" />

      <div className="relative flex items-center justify-around h-[60px] px-1 safe-area-inset-bottom">
        {ONCAMPUS_DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            router.pathname === item.href ||
            (item.href !== "/dashboard" &&
              router.pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 transition-all active:scale-95 duration-200",
                isActive ? "text-[#ff5757]" : "text-slate-400 dark:text-[#555]",
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
                      : "text-slate-400 dark:text-[#555]",
                  )}
                />
                {item.badge === "hot" && (
                  <span className="absolute top-0 right-1 flex h-1.5 w-1.5">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                  </span>
                )}
                {item.badge === "new" && (
                  <span className="absolute top-0 right-1 flex h-1.5 w-1.5">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide leading-none",
                  isActive
                    ? "text-[#ff5757]"
                    : "text-slate-400 dark:text-[#555]",
                )}
              >
                {item.shortLabel ?? item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
