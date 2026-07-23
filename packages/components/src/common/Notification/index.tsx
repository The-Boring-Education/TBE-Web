import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowRightIcon,
  BellIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useNotifications, useUser } from "@tbe/hooks";
import { AnimatePresence, motion } from "framer-motion";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";

const PANEL_CLASSES =
  "fixed z-30 top-16 right-2 w-[22rem] shadow-2xl rounded-2xl bg-white border border-gray-100 overflow-hidden md:absolute md:top-auto md:mt-3 md:w-96 md:right-0 md:left-auto md:mx-0";

const BellButton = ({
  hasUnread,
  ariaLabel,
}: {
  hasUnread: boolean;
  ariaLabel: string;
}) => (
  <PopoverButton
    aria-label={ariaLabel}
    className="relative flex w-10 h-10 justify-center items-center rounded-full border-2 border-primary text-primary hover:text-white hover:bg-primary transition-colors outline-none"
  >
    <BellIcon aria-hidden="true" className="h-5 w-5" />
    {hasUnread && (
      <span
        aria-hidden="true"
        className="absolute top-1 right-1 flex h-2.5 w-2.5"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white" />
      </span>
    )}
  </PopoverButton>
);

const PanelHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
    <p className="text-sm font-semibold text-gray-900">{title}</p>
    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
  </div>
);

const LoggedOutView = ({ onLoginClick }: { onLoginClick: () => void }) => (
  <Fragment>
    <PanelHeader
      title="Stay in the loop"
      subtitle="Sign in to see personalized updates"
    />
    <div className="px-4 py-6 flex flex-col items-center text-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <BellIcon aria-hidden="true" className="h-7 w-7 text-primary" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-900">
          You&apos;re missing out on updates
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Log in to get notified about new webinars, cohorts, courses and career
          opportunities tailored for you.
        </p>
      </div>
      <button
        className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
        type="button"
        onClick={onLoginClick}
      >
        Login to continue
        <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  </Fragment>
);

const EmptyLoggedInView = () => (
  <div className="px-4 py-8 flex flex-col items-center text-center gap-2">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
      <CheckCircleIcon aria-hidden="true" className="h-6 w-6 text-green-500" />
    </div>
    <p className="text-sm font-semibold text-gray-900">
      You&apos;re all caught up
    </p>
    <p className="text-xs text-gray-500">
      We&apos;ll notify you here when there&apos;s something new.
    </p>
  </div>
);

const LoadingView = () => (
  <div className="p-3 flex flex-col gap-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-full h-16 rounded-xl bg-gray-100 animate-pulse"
      />
    ))}
  </div>
);

type Notification = {
  type?: string;
  text?: string;
  link?: string;
  isExternalLink?: boolean;
};

const NotificationItem = ({
  notification,
  index,
}: {
  notification: Notification;
  index: number;
}) => {
  const { type, text, link, isExternalLink } = notification;

  const content = (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group p-3 rounded-xl border border-gray-100 bg-white hover:border-primary/40 hover:bg-primary/5 transition-colors"
      initial={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <div className="flex items-start justify-between gap-2">
        {type && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {type}
          </span>
        )}
        {link && (
          <ArrowRightIcon
            aria-hidden="true"
            className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0"
          />
        )}
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-700 leading-snug text-left">
          {text}
        </p>
      )}
    </motion.div>
  );

  if (!link) return content;

  if (isExternalLink) {
    return (
      <a
        href={link}
        rel="noopener noreferrer"
        target="_blank"
        className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      >
        {content}
      </a>
    );
  }

  return (
    <NextLink
      className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      href={link}
    >
      {content}
    </NextLink>
  );
};

const NotificationsList = ({
  notifications,
}: {
  notifications: Notification[];
}) => (
  <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-2">
    <AnimatePresence>
      {notifications.map((notification, index) => (
        <NotificationItem
          key={index}
          index={index}
          notification={notification}
        />
      ))}
    </AnimatePresence>
  </div>
);

const NotificationPopover = () => {
  const { isAuth, loading: authLoading } = useUser();
  const { notifications, loading } = useNotifications({ enabled: isAuth });
  const router = useRouter();

  const hasUnread = isAuth && notifications && notifications.length > 0;

  const handleLoginClick = () => {
    const redirect = encodeURIComponent(router.asPath || "/");
    router.push(`/login?redirect=${redirect}`);
  };

  return (
    <Popover className="relative">
      <BellButton ariaLabel="Open notifications" hasUnread={!!hasUnread} />

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className={PANEL_CLASSES}>
          {!isAuth && !authLoading ? (
            <LoggedOutView onLoginClick={handleLoginClick} />
          ) : (
            <Fragment>
              <PanelHeader
                title="Notifications"
                subtitle={
                  notifications && notifications.length > 0
                    ? `You have ${notifications.length} update${
                        notifications.length === 1 ? "" : "s"
                      }`
                    : "Latest updates for you"
                }
              />
              {loading || authLoading ? (
                <LoadingView />
              ) : notifications && notifications.length > 0 ? (
                <NotificationsList
                  notifications={notifications as Notification[]}
                />
              ) : (
                <EmptyLoggedInView />
              )}
            </Fragment>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default NotificationPopover;
