import { Popover, Transition } from "@headlessui/react";
import { useAuth } from "@tbe/auth";
import { Image, Link } from "@tbe/components";
import { routes, toPlatformUrl } from "@tbe/constants";
import { Fragment, useEffect, useState } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuLayoutGrid,
  LuLogOut,
  LuUser,
} from "react-icons/lu";

export interface UserAvatarProps {
  dashboardRoute?: string;
  profileRoute?: string;
  theme?: "light" | "dark";
  variant?: string;
}

const UserAvatar = ({
  dashboardRoute,
  profileRoute,
  theme,
  variant,
}: UserAvatarProps = {}) => {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  if (isLoading) return null;
  if (!isAuthenticated || !user) return null;

  const isDark =
    theme === "dark" || variant === "dsayatra" || variant === "oncampus";

  const isPlatform =
    variant === "platform" ||
    variant === "default" ||
    (!variant &&
      (!dashboardRoute ||
        dashboardRoute === "/learn" ||
        dashboardRoute === "/user/dashboard"));

  // 1. Determine First Item (Learn vs Dashboard)
  const firstItemTitle = isPlatform ? "Learn" : "Dashboard";
  const firstItemHref = isPlatform
    ? routes.learn
    : dashboardRoute || "/dashboard";

  // 2. Determine Profile Route
  const finalProfileRoute =
    profileRoute ||
    (isPlatform ? "/profile" : toPlatformUrl(routes.user.profile));

  const handleLogout = () => {
    signOut("/login");
  };

  return (
    <div className="relative">
      <Popover className="relative">
        {({ open, close }) => (
          <>
            <Popover.Button
              aria-label="User profile menu"
              className={`group flex items-center gap-1 p-0.5 rounded-full bg-transparent hover:bg-transparent transition cursor-pointer outline-none focus:outline-none ${
                isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] rounded-full border overflow-hidden flex-shrink-0 flex items-center justify-center transition ${
                  open
                    ? "ring-2 ring-[#FF5757] border-[#FF5757]"
                    : isDark
                      ? "border-neutral-700 bg-neutral-850"
                      : "border-slate-200 bg-slate-100"
                }`}
              >
                {user?.image ? (
                  <div className="w-full h-full relative rounded-full overflow-hidden">
                    <Image
                      alt={user?.name || "User Avatar"}
                      className="w-full h-full rounded-full object-cover"
                      fullHeight={false}
                      fullWidth={false}
                      src={user.image}
                    />
                  </div>
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isDark ? "text-neutral-200" : "text-slate-700"
                    }`}
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <LuChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                } ${
                  isDark
                    ? "text-neutral-400 group-hover:text-white"
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="transform opacity-0 scale-95 -translate-y-1"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 -translate-y-1"
            >
              <Popover.Panel
                className={`absolute z-50 mt-2 right-0 w-56 sm:w-60 origin-top-right rounded-xl p-1.5 focus:outline-none border shadow-xl ${
                  isDark
                    ? "bg-[#0a0a0a] border-neutral-800/90 text-white shadow-black/80 ring-1 ring-white/5"
                    : "bg-white border-slate-200/80 text-slate-900 shadow-slate-900/10"
                }`}
              >
                {/* Subtle top pointer */}
                <div
                  className={`absolute -top-1 right-4 w-2 h-2 rotate-45 border-t border-l ${
                    isDark
                      ? "bg-[#0a0a0a] border-neutral-800/90"
                      : "bg-white border-slate-200/80"
                  }`}
                />

                <div className="relative z-10 flex flex-col gap-0.5">
                  {/* Item 1: Learn / Dashboard */}
                  <Link
                    href={firstItemHref}
                    onClick={() => close()}
                    className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition ${
                      isDark
                        ? "hover:bg-neutral-900 text-white"
                        : "hover:bg-slate-50 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LuLayoutGrid
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isDark
                            ? "text-[#FF7A7A] group-hover:text-[#FF5757]"
                            : "text-[#FF5757] group-hover:text-[#e04343]"
                        }`}
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <span
                          className={`text-xs font-semibold tracking-tight ${
                            isDark
                              ? "text-neutral-200 group-hover:text-white"
                              : "text-slate-800 group-hover:text-slate-900"
                          }`}
                        >
                          {firstItemTitle}
                        </span>
                        <span
                          className={`text-[10px] font-normal leading-tight truncate ${
                            isDark ? "text-neutral-500" : "text-slate-400"
                          }`}
                        >
                          Overview & stats
                        </span>
                      </div>
                    </div>
                    <LuChevronRight
                      className={`w-3 h-3 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        isDark
                          ? "text-neutral-600 group-hover:text-neutral-400"
                          : "text-slate-300 group-hover:text-slate-500"
                      }`}
                    />
                  </Link>

                  {/* Divider */}
                  <div
                    className={`h-px w-full my-0.5 ${
                      isDark ? "bg-neutral-800/70" : "bg-slate-100"
                    }`}
                  />

                  {/* Item 2: Profile */}
                  <Link
                    href={finalProfileRoute}
                    onClick={() => close()}
                    className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition ${
                      isDark
                        ? "hover:bg-neutral-900 text-white"
                        : "hover:bg-slate-50 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LuUser
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isDark
                            ? "text-indigo-400 group-hover:text-indigo-300"
                            : "text-indigo-500 group-hover:text-indigo-600"
                        }`}
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <span
                          className={`text-xs font-semibold tracking-tight ${
                            isDark
                              ? "text-neutral-200 group-hover:text-white"
                              : "text-slate-800 group-hover:text-slate-900"
                          }`}
                        >
                          Profile
                        </span>
                        <span
                          className={`text-[10px] font-normal leading-tight truncate ${
                            isDark ? "text-neutral-500" : "text-slate-400"
                          }`}
                        >
                          View & edit profile
                        </span>
                      </div>
                    </div>
                    <LuChevronRight
                      className={`w-3 h-3 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        isDark
                          ? "text-neutral-600 group-hover:text-neutral-400"
                          : "text-slate-300 group-hover:text-slate-500"
                      }`}
                    />
                  </Link>

                  {/* Divider */}
                  <div
                    className={`h-px w-full my-0.5 ${
                      isDark ? "bg-neutral-800/70" : "bg-slate-100"
                    }`}
                  />

                  {/* Item 3: Logout */}
                  <button
                    type="button"
                    aria-label="Logout"
                    onClick={() => {
                      close();
                      handleLogout();
                    }}
                    className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition cursor-pointer text-left ${
                      isDark ? "hover:bg-red-950/20" : "hover:bg-red-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LuLogOut className="w-4 h-4 shrink-0 text-red-500/80 group-hover:text-red-500 transition-colors" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-semibold tracking-tight text-red-500 dark:text-red-400 group-hover:text-red-600">
                          Logout
                        </span>
                        <span
                          className={`text-[10px] font-normal leading-tight truncate ${
                            isDark ? "text-neutral-500" : "text-slate-400"
                          }`}
                        >
                          Sign out
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default UserAvatar;
