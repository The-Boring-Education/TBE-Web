import { Popover, Transition } from "@headlessui/react";
import { useAuth } from "@tbe/auth";
import { Image, Link } from "@tbe/components";
import { TOP_NAVIGATION } from "@tbe/constants";
import { Fragment, useEffect, useState } from "react";

interface UserAvatarProps {
  dashboardRoute?: string;
  profileRoute?: string;
}

const UserAvatar = ({ dashboardRoute, profileRoute }: UserAvatarProps = {}) => {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  if (isLoading) return null;
  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    signOut("/login");
  };

  return (
    <div className="relative">
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              aria-label="User profile menu"
              className={`
                ${open ? "ring-2 ring-primary" : ""}
                outline-none p-0 w-[40px] h-[40px] border-[2px] border-gray-300 relative overflow-hidden flex-shrink-0 flex items-center justify-center
                hover:opacity-80 transition focus:outline-none rounded-full cursor-pointer`}
            >
              {user?.image ? (
                <div
                  className="w-[40px] h-[40px] relative rounded-[50%] overflow-hidden"
                  style={{ position: "relative" }}
                >
                  <Image
                    alt={user?.name || ""}
                    className="w-[40px] h-[40px] rounded-[50%] object-cover"
                    fullHeight={false}
                    fullWidth={false}
                    src={user.image}
                  />
                </div>
              ) : (
                <div className="w-[40px] h-[40px] rounded-[50%] bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95 translate-y-1"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 translate-y-1"
            >
              <Popover.Panel className="absolute z-50 mt-1.5 right-0 w-40 origin-top-right rounded-lg bg-white/80 p-1 shadow-2xl backdrop-blur-md ring-1 ring-black/5 focus:outline-none dark:bg-[#1A1A1A]/80 dark:ring-white/10 flex flex-col gap-0.5 border border-white/20 dark:border-white/10">
                {TOP_NAVIGATION.user.map(({ id, name, href, target }) => (
                  <Link
                    key={id}
                    className="group flex w-full items-center rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary dark:text-gray-200 dark:hover:from-primary/20 dark:hover:text-primary"
                    href={
                      id === "user-dashboard" && dashboardRoute
                        ? dashboardRoute
                        : id === "user-profile" && profileRoute
                          ? profileRoute
                          : href
                    }
                    target={target}
                  >
                    {name}
                  </Link>
                ))}
                <div className="h-px w-full bg-gray-200/50 dark:bg-white/5 my-0.5" />
                <button
                  className="group flex w-full items-center rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default UserAvatar;
