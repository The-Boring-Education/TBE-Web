import { cn } from "@tbe/utils";
import {
  ClipboardList,
  FileText,
  Home,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sheets", href: "/sheets", icon: Target },
  { name: "Revisions", href: "/revisions", icon: FileText },
  { name: "Topics", href: "/topics", icon: ClipboardList },
  { name: "Progress", href: "/dashboard#overall-progress", icon: TrendingUp },
];

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
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard#overall-progress"
              ? false
              : router.pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-2 transition-all duration-200 active:scale-95",
                isActive ? "text-[#ff5757]" : "text-[#555]",
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-9 h-7 rounded-xl transition-all duration-200",
                  isActive && "bg-[#ff5757]/15",
                )}
              >
                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] transition-all duration-200",
                    isActive ? "text-[#ff5757]" : "text-[#555]",
                  )}
                />
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ff5757]" />
                )}
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
