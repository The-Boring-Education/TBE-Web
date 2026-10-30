import { useAuth } from "@tbe/auth";
import { isDashboardSidebarLinkActive, LoadingSpinner } from "@tbe/components";
import { useGamification } from "@tbe/gamification";
import { usePaymentStatus, useUser } from "@tbe/hooks";
import { Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiLogOut,
  FiMoon,
  FiSun,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { MobileNav } from "@/components/navigation/MobileNav";
import { DSA_DASHBOARD_NAV_ITEMS } from "@/config/dsaDashboardNavItems";

interface DsaDashboardLayoutProps {
  children: ReactNode;
}

const DsaDashboardLayout = ({ children }: DsaDashboardLayoutProps) => {
  const router = useRouter();
  const { user, isAuth, loading } = useUser();
  const { signOut } = useAuth();
  const { points: rawPoints } = useGamification();

  const userPoints = rawPoints ?? 0;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: "lifetime",
    productType: "DSA_YATRA",
    isPremium: true,
  });

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [loading, isAuth, router]);

  useEffect(() => {
    const checkDark = () => {
      if (typeof document !== "undefined") {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
      }
    };
    if (typeof document !== "undefined") {
      if (
        !document.documentElement.classList.contains("dark") &&
        !document.documentElement.classList.contains("light")
      ) {
        document.documentElement.classList.add("dark");
      }
    }
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleToggleDarkMode = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        setIsDarkMode(false);
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        setIsDarkMode(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9] dark:bg-[#0E0E11]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  const displayName = user?.name || "DSA Learner";
  const displayEmail = user?.email || "";
  const avatarInitial = displayName.charAt(0).toUpperCase() || "D";
  const avatarUrl =
    (user as any)?.image ||
    (user as any)?.picture ||
    (user as any)?.profilePicture ||
    (user as any)?.avatar ||
    (user as any)?.photoURL;

  return (
    <div className="w-full h-screen h-[100dvh] max-h-[100dvh] bg-[#F1F5F9] dark:bg-[#0E0E11] flex relative font-sans overflow-hidden p-0.5 sm:p-1 gap-1 text-slate-900 dark:text-white">
      {/* Left Column: Navigation Sidebar in a Curved Rectangle */}
      <aside
        className={`${
          isSidebarCollapsed
            ? "w-11 sm:w-[54px] px-0.5 sm:px-1"
            : "w-[180px] sm:w-[215px] px-1 sm:px-2"
        } max-lg:hidden bg-white dark:bg-[#131316] rounded-2xl border border-slate-200/90 dark:border-[#24242A] shadow-2xs h-full flex flex-col justify-between py-1.5 sm:py-2 shrink-0 transition-[width,padding] duration-300 ease-in-out select-none z-30 relative`}
      >
        <div className="space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {/* Top Bar: Theme Mode Button + Collapse Toggle */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed
                ? "flex-col gap-1 justify-center"
                : "justify-between px-0.5"
            } pb-0.5`}
          >
            <button
              type="button"
              onClick={handleToggleDarkMode}
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
              aria-label={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
              className="w-5.5 h-5.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#202026] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              {isDarkMode ? (
                <FiSun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <FiMoon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202026] transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <FiChevronsRight className="w-3.5 h-3.5" />
              ) : (
                <FiChevronsLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Branding */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center px-0" : "px-1.5 gap-2.5"
            } py-1`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF4D4D] to-[#E02424] text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/25">
              <Layers className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight block truncate leading-tight">
                  DSA Vault
                </span>
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold block tracking-wide">
                  Learn • Practice • Grow
                </span>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-b border-slate-100 dark:border-[#24242A] my-0.5" />

          {/* Navigation Section */}
          <div className="space-y-0.5 pt-0.5">
            <div
              className={`px-2 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isSidebarCollapsed ? "opacity-0 h-0 my-0" : "opacity-100 py-0.5"
              }`}
            >
              Navigation
            </div>

            <nav className="space-y-0.5">
              {DSA_DASHBOARD_NAV_ITEMS.map((item) => {
                const isActive = isDashboardSidebarLinkActive(
                  router.pathname,
                  router.asPath,
                  item.href,
                );

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => router.push(item.href)}
                    title={isSidebarCollapsed ? item.name : undefined}
                    className={`w-full relative flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0" : "px-2 gap-2"
                    } py-1.5 rounded-lg text-xs transition-colors duration-200 cursor-pointer overflow-hidden ${
                      isActive
                        ? "bg-red-50/70 dark:bg-red-950/40 text-[#FF4D4D] font-bold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1E1E24] hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-[#FF4D4D] rounded-r-full" />
                    )}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {item.icon ? (
                        <item.icon
                          className={`w-3.5 h-3.5 ${
                            isActive
                              ? "text-[#FF4D4D]"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        />
                      ) : null}
                    </div>
                    <span
                      className={`whitespace-nowrap flex-1 text-left truncate transition-opacity duration-200 ${
                        isSidebarCollapsed ? "hidden" : "block"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Upsell / Lifetime Access Card if not purchased */}
          {!isPurchased && !isSidebarCollapsed && (
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-50 to-orange-50/60 dark:from-red-950/30 dark:to-orange-950/20 border border-red-100 dark:border-red-900/40 space-y-1.5 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D4D]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Lifetime Access</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                Unlock all 400+ questions, visualizers & patterns.
              </p>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="w-full py-1 text-[11px] font-bold rounded-lg bg-[#FF4D4D] text-white hover:bg-[#EE3126] transition-all shadow-2xs cursor-pointer text-center block"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Motivation Banner Image (Replaces Stay Consistent block) */}
          {!isSidebarCollapsed && (
            <div className="mt-2 rounded-xl overflow-hidden shadow-2xs border border-slate-200/80 dark:border-[#24242A]">
              <img
                src="https://ik.imagekit.io/riufvimprm/TBE/dsayatra-motivation-banner.png"
                alt="DSA Motivation"
                className="w-full h-auto object-cover select-none"
              />
            </div>
          )}
        </div>

        {/* Bottom User Profile Section */}
        {isSidebarCollapsed ? (
          /* Collapsed State */
          <div className="pt-1 border-t border-slate-100 dark:border-[#24242A] mt-auto relative group flex justify-center shrink-0">
            {/* Popover on hover */}
            <div className="absolute left-full bottom-0 ml-2 w-44 p-1.5 bg-white dark:bg-[#18181D] rounded-xl border border-slate-200/90 dark:border-[#2C2C36] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
              <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-1 border-b border-slate-100 dark:border-[#24242A]">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  {displayEmail && (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                      {displayEmail}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <FiZap className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                  <span className="text-[10px] font-black">
                    {userPoints} XP
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#23232B] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FiUser className="w-3 h-3 text-slate-500" />
                  <span>Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    signOut
                      ? signOut("/login")
                      : (window.location.href = "/login")
                  }
                  className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                >
                  <FiLogOut className="w-3 h-3" />
                  <span>Log out</span>
                </button>
              </div>
            </div>

            {/* Avatar with XP dot */}
            <div className="relative cursor-pointer p-0.5">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-tr from-[#FF3B30] to-orange-400 text-white font-bold text-[9px] flex items-center justify-center border border-slate-200/80 dark:border-white/10 shadow-2xs">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span>{avatarInitial}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <FiZap className="w-1.5 h-1.5 fill-white text-white" />
              </div>
            </div>
          </div>
        ) : (
          /* Expanded State */
          <div className="pt-1 border-t border-slate-100 dark:border-[#24242A] mt-auto relative group shrink-0">
            {/* Popover on hover */}
            <div className="absolute bottom-full left-0 right-0 mb-1.5 p-1 bg-white dark:bg-[#18181D] rounded-xl border border-slate-200/90 dark:border-[#2C2C36] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out -translate-y-1 group-hover:translate-y-0 z-50">
              <div className="px-2 py-1 mb-1 border-b border-slate-100 dark:border-[#24242A]">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </div>
                {displayEmail && (
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                    {displayEmail}
                  </div>
                )}
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#23232B] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <FiUser className="w-3 h-3 text-slate-500" />
                <span>Profile</span>
              </Link>

              <button
                type="button"
                onClick={() =>
                  signOut
                    ? signOut("/login")
                    : (window.location.href = "/login")
                }
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
              >
                <FiLogOut className="w-3 h-3" />
                <span>Log out</span>
              </button>
            </div>

            {/* User Bar */}
            <div className="flex items-center justify-between gap-1 p-0.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1C1C22] transition-colors cursor-pointer">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-tr from-[#FF3B30] to-orange-400 text-white font-bold text-[9px] flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-white/10 shadow-2xs">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{avatarInitial}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {displayName}
                  </div>
                  {displayEmail && (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                      {displayEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* XP Count */}
              <div
                title={`${userPoints} Total XP`}
                className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0"
              >
                <FiZap className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                <span className="text-[10px] font-black">{userPoints}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Right Column: Main Content Area in Matching Curved Rectangle */}
      <main className="flex-1 min-w-0 bg-white dark:bg-[#131316] rounded-2xl border border-slate-200/90 dark:border-[#24242A] shadow-2xs h-full p-2.5 sm:p-3.5 md:p-4 space-y-2.5 overflow-y-auto overflow-x-hidden relative max-lg:pb-18">
        {children}
      </main>

      <MobileNav />
    </div>
  );
};

export default DsaDashboardLayout;
