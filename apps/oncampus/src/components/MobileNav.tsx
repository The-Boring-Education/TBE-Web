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
      {/* Frosted glass backdrop - Exactly like DSA Yatra */}
      <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-2xl border-t border-[#1e1e1e]" />

      <div className="relative flex items-center justify-around px-1 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))]">
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
                "flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-200 active:scale-95",
                isActive ? "text-[#ff5757]" : "text-[#555]",
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-200",
                )}
              >
                <item.icon
                  className={cn(
                    "w-[20px] h-[20px] transition-all duration-200",
                    isActive
                      ? "text-[#ff5757] drop-shadow-[0_0_12px_rgba(255,87,87,0.7)]"
                      : "text-[#555]",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[11px] font-black tracking-tight leading-none text-center px-1 truncate w-full",
                  isActive ? "text-[#ff5757]" : "text-[#666]",
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
