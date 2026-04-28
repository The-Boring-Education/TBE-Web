import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { getNavbarVariantConfig, LINKS, TOP_NAVIGATION } from "@tbe/constants";
import { useScrollDirection } from "@tbe/hooks";
import type {
  MainNavbarProps,
  NavbarNavigationConfig,
  NavbarSectionVisibility,
  NavbarVariantConfig,
} from "@tbe/interface";
import type { TopNavbarLinkProps } from "@tbe/types";
import { cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import NextLink from "next/link";
import { Fragment, useMemo, useState } from "react";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

import {
  FlexContainer,
  LearningSidebarPanel,
  Link,
  LinkButton,
  LoginRedirectButton,
  Logo,
  MobileNavbarLinksContainer,
  NavbarDropdownContainer,
  PopoverContainer,
  ProductLogo,
  Text,
  UserAvatar,
  UserPointButton,
} from "..";
import NotificationPopover from "../common/Notification/index";

function resolveSection(
  visibility: NavbarSectionVisibility | undefined,
  allLinks: TopNavbarLinkProps[],
): { visible: boolean; links: TopNavbarLinkProps[] } {
  if (visibility === false) return { visible: false, links: [] };
  if (visibility === undefined || visibility === true)
    return { visible: true, links: allLinks };
  const filtered = allLinks.filter((link) =>
    (visibility as string[]).includes(link.id),
  );
  return { visible: filtered.length > 0, links: filtered };
}

const Navbar = ({
  onSignOut,
  userId,
  variant = "default",
  showFullNavigation = true,
  customBranding,
  customActions = [],
  dashboardRoute,
  theme,
  totalChapters = 0,
  completedChapters = 0,
  sidebarTitle = "Progress",
  sidebarContent,
  showBackButton = false,
  backButtonHref = "/",
  compact = false,
  hidePricingLink = false,
}: MainNavbarProps = {}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [learningSidebarOpen, setLearningSidebarOpen] = useState(false);
  const { isVisible } = useScrollDirection(100);

  const handleSetOpen = (popoverName: string) => {
    setOpenPopover(openPopover === popoverName ? null : popoverName);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const VARIANT_CONFIG = useMemo(() => getNavbarVariantConfig(Logo), []);
  const variantConfig = useMemo(() => {
    return VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  }, [variant, VARIANT_CONFIG]) as NavbarVariantConfig;

  const nav: NavbarNavigationConfig = variantConfig.navigation ?? {};

  const issuesNav = useMemo(
    () => resolveSection(nav.issues, TOP_NAVIGATION.issues),
    [nav.issues],
  );

  const learnNav = useMemo(
    () => resolveSection(nav.learn, TOP_NAVIGATION.products),
    [nav.learn],
  );
  const toolsNav = useMemo(
    () => resolveSection(nav.tools, TOP_NAVIGATION.tools),
    [nav.tools],
  );
  const linksNav = useMemo(
    () => resolveSection(nav.links, TOP_NAVIGATION.links),
    [nav.links],
  );

  const getBackgroundClass = () => {
    if (variant === "transparent") {
      return "glass-dark backdrop-blur-md";
    }
    if (theme === "dark") {
      return "bg-black";
    }
    return "bg-white";
  };

  const finalDashboardRoute = dashboardRoute || variantConfig.dashboardRoute;

  const finalBranding =
    customBranding ||
    (variantConfig.productName ? (
      <NextLink
        href={finalDashboardRoute}
        className="no-underline hover:opacity-90 transition-opacity"
      >
        <ProductLogo
          productName={variantConfig.productName}
          subText={variantConfig.subText}
        />
      </NextLink>
    ) : (
      variantConfig.branding
    ));

  const borderClass =
    theme === "dark" ? "border-0" : variantConfig.borderClass || "border";
  const shouldUseCustomActions = customActions && customActions.length > 0;
  const isLearningVariant = variant === "learning";

  const requiresAuth = variantConfig.requiresAuth !== false;

  const showGamification =
    requiresAuth && variantConfig.showGamification !== false;

  const showNotifications = variantConfig.showNotifications !== false;

  return (
    <motion.header
      animate={{ y: isVisible ? 0 : -100 }}
      className={`fixed top-0 left-0 right-0 z-40 ${getBackgroundClass()} shadow-md shadow-white/5 dark:shadow-[0_1px_15px_rgba(255,255,255,0.1)]`}
      initial={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <nav
        className={cn(
          "flex items-center justify-between",
          compact ? "p-[6px] lg:px-[16px]" : "p-[12px] lg:px-[32px]",
          borderClass,
        )}
      >
        <div className="flex items-center gap-[16px]">
          {showBackButton && (
            <LinkButton
              href={backButtonHref}
              buttonProps={{
                variant: "OUTLINE",
                size: "SMALL",
                text: "← Back",
                className:
                  "border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 py-[4px] px-[8px] h-auto whitespace-nowrap",
              }}
            />
          )}
          {finalBranding}
          {isLearningVariant && (
            <button
              className={`flex items-center justify-center rounded-md p-[6px] ${
                theme === "dark"
                  ? "text-white hover:bg-gray-800"
                  : "text-black hover:bg-gray-100"
              }`}
              type="button"
              onClick={() => setLearningSidebarOpen(true)}
            >
              <Bars3Icon
                aria-hidden="true"
                className={`h-[16px] w-[16px] ${theme === "dark" ? "text-white" : "text-black"}`}
              />
            </button>
          )}
        </div>
        {shouldUseCustomActions ? (
          <>
            <div className="flex lg:hidden gap-[8px] items-center">
              {requiresAuth && (
                <UserAvatar dashboardRoute={finalDashboardRoute} />
              )}
              <button
                className={`-m-[10px] flex items-center justify-center rounded-md p-[10px] ${theme === "dark" ? "text-white" : "text-black"}`}
                type="button"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon
                  aria-hidden="true"
                  className={`h-[24px] w-[24px] ${theme === "dark" ? "text-white" : "text-black"}`}
                />
              </button>
            </div>
            {/* Desktop Actions - explicit hidden for mobile, flex row for desktop */}
            <div className="hidden max-lg:hidden lg:flex lg:flex-row lg:items-center lg:gap-[16px] lg:visible">
              {customActions.map((action: React.ReactNode, index: number) => (
                <div key={index}>{action}</div>
              ))}
              {requiresAuth && showNotifications && <NotificationPopover />}
              {/* {showGamification && <UserPointButton />} */}
              {requiresAuth && <LoginRedirectButton text="Login" />}
              {requiresAuth && (
                <UserAvatar dashboardRoute={finalDashboardRoute} />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex lg:hidden gap-[8px] items-center">
              {requiresAuth && showNotifications && <NotificationPopover />}
              {showGamification && <UserPointButton />}
              {requiresAuth && (
                <UserAvatar dashboardRoute={finalDashboardRoute} />
              )}
              <button
                className={`-m-[10px] flex items-center justify-center rounded-md p-[10px] ${theme === "dark" ? "text-white" : "text-black"}`}
                type="button"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon
                  aria-hidden="true"
                  className={`h-[24px] w-[24px] ${theme === "dark" ? "text-white" : "text-black"}`}
                />
              </button>
            </div>
            {showFullNavigation && (
              <div className="hidden items-center lg:flex lg:gap-x-[24px]">
                {issuesNav.visible && issuesNav.links[0]?.href && (
                  <FlexContainer direction="col" itemCenter={false}>
                    <Link
                      className={`text-base ${theme === "dark" ? "text-white" : "text-black"} hover:text-primary`}
                      href={issuesNav.links[0].href}
                      target={issuesNav.links[0]?.target}
                    >
                      {issuesNav.links[0]?.name}
                    </Link>
                  </FlexContainer>
                )}

                {learnNav.visible && (
                  <PopoverContainer
                    isOpen={openPopover === "products"}
                    label="Learn"
                    onToggle={() => handleSetOpen("products")}
                    theme={theme}
                  >
                    <NavbarDropdownContainer links={learnNav.links} />
                  </PopoverContainer>
                )}
                {variantConfig.pricingNavLink && !hidePricingLink && (
                  <FlexContainer direction="col" itemCenter={false}>
                    <Link
                      className={`text-base ${theme === "dark" ? "text-white" : "text-black"} hover:text-primary`}
                      href={variantConfig.pricingNavLink.href}
                    >
                      {variantConfig.pricingNavLink.label ?? "Pricing"}
                    </Link>
                  </FlexContainer>
                )}
                {toolsNav.visible && (
                  <PopoverContainer
                    isOpen={openPopover === "tools"}
                    label="Tools"
                    onToggle={() => handleSetOpen("tools")}
                    theme={theme}
                  >
                    <NavbarDropdownContainer links={toolsNav.links} />
                  </PopoverContainer>
                )}
                {linksNav.visible && (
                  <PopoverContainer
                    isOpen={openPopover === "links"}
                    label="Links"
                    panelClasses="-left-6"
                    onToggle={() => handleSetOpen("links")}
                    theme={theme}
                  >
                    <NavbarDropdownContainer links={linksNav.links} />
                  </PopoverContainer>
                )}

                {requiresAuth && showNotifications && <NotificationPopover />}
                {showGamification && <UserPointButton />}
                {requiresAuth && <LoginRedirectButton text="Login" />}
                {requiresAuth && (
                  <UserAvatar dashboardRoute={finalDashboardRoute} />
                )}
              </div>
            )}
          </>
        )}
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel
          className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto ${theme === "dark" ? "bg-[#0A0A0A]" : "bg-white"} p-2 sm:max-w-sm sm:ring-1 ${theme === "dark" ? "sm:ring-gray-100/10" : "sm:ring-gray-900/10"}`}
        >
          <div className="flex items-center justify-between">
            {finalBranding}
            <button
              className={`-m-2.5 rounded-md p-2.5 ${theme === "dark" ? "text-white" : "text-black"}`}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <AnimatePresence>
            <motion.div
              key="cohorts-popover"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mt-6 flow-root">
                <div className="divide-white-500/10 -my-6 divide-y">
                  <FlexContainer
                    className="gap-2 space-y-2 py-6"
                    direction="col"
                    itemCenter={false}
                  >
                    {shouldUseCustomActions &&
                      customActions.map(
                        (action: React.ReactNode, index: number) => (
                          <div key={index} className="w-full">
                            {action}
                          </div>
                        ),
                      )}
                    {/* Add Gamification and Notifications to Mobile Menu */}
                    {shouldUseCustomActions && (
                      <FlexContainer
                        className="gap-2"
                        itemCenter={false}
                        justifyCenter={false}
                      >
                        {requiresAuth && showNotifications && (
                          <NotificationPopover />
                        )}
                        {showGamification && <UserPointButton />}
                      </FlexContainer>
                    )}
                    {requiresAuth && (
                      <FlexContainer
                        className="gap-1"
                        direction="col"
                        itemCenter={false}
                        justifyCenter={false}
                      >
                        <LoginRedirectButton text="Login" />
                      </FlexContainer>
                    )}

                    {learnNav.visible && (
                      <MobileNavbarLinksContainer
                        links={learnNav.links}
                        title="Learn"
                        onLinkClick={handleCloseMobileMenu}
                      />
                    )}
                    {variantConfig.pricingNavLink && !hidePricingLink && (
                      <FlexContainer
                        className="py-2"
                        direction="col"
                        itemCenter={false}
                      >
                        <Link
                          className={`text-base font-medium ${theme === "dark" ? "text-white" : "text-black"} hover:text-primary`}
                          href={variantConfig.pricingNavLink.href}
                          onClick={handleCloseMobileMenu}
                        >
                          {variantConfig.pricingNavLink.label ?? "Pricing"}
                        </Link>
                      </FlexContainer>
                    )}
                    {toolsNav.visible && (
                      <MobileNavbarLinksContainer
                        links={toolsNav.links}
                        title="Tools"
                        onLinkClick={handleCloseMobileMenu}
                      />
                    )}
                    {linksNav.visible && (
                      <MobileNavbarLinksContainer
                        links={linksNav.links}
                        title="Links"
                        onLinkClick={handleCloseMobileMenu}
                      />
                    )}
                    <FlexContainer
                      className="gap-1"
                      direction="col"
                      itemCenter={false}
                      justifyCenter={false}
                    >
                      <Text
                        className={`pre-title ${theme === "dark" ? "text-gray-400" : "text-greyDark"}`}
                        level="span"
                      >
                        Connect with us
                      </Text>
                      <FlexContainer
                        className="gap-1"
                        itemCenter={false}
                        justifyCenter={false}
                      >
                        <Link href={LINKS.instagram} target="_blank">
                          <FaInstagram
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                            size="2em"
                          />
                        </Link>
                        <Link href={LINKS.youtube} target="_blank">
                          <FaYoutube
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                            size="2em"
                          />
                        </Link>
                        <Link href={LINKS.officialLinkedIn} target="_blank">
                          <FaLinkedin
                            className={
                              theme === "dark" ? "text-white" : "text-black"
                            }
                            size="2em"
                          />
                        </Link>
                      </FlexContainer>
                    </FlexContainer>
                  </FlexContainer>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Dialog.Panel>
      </Dialog>

      {isLearningVariant && (
        <Transition show={learningSidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={setLearningSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-200"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-150"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Dialog.Panel
                      className={`pointer-events-auto w-80 max-w-sm ${
                        theme === "dark"
                          ? "bg-[#111111] text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <LearningSidebarPanel
                        title={sidebarTitle}
                        totalItems={totalChapters}
                        completedItems={completedChapters}
                        theme={theme}
                        onClose={() => setLearningSidebarOpen(false)}
                      >
                        {sidebarContent}
                      </LearningSidebarPanel>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </motion.header>
  );
};

export default Navbar;
