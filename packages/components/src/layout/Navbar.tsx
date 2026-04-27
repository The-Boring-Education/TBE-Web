import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { getNavbarVariantConfig, LINKS, TOP_NAVIGATION } from "@tbe/constants";
import { useScrollDirection, useTheme } from "@tbe/hooks";
import type {
  MainNavbarProps,
  NavbarNavigationConfig,
  NavbarSectionVisibility,
  NavbarVariantConfig,
} from "@tbe/interface";
import type { TopNavbarLinkProps } from "@tbe/types";
import { cn } from "@tbe/utils";
import NextLink from "next/link";
import React, { useMemo, useState } from "react";
import {
  FaInstagram,
  FaLinkedin,
  FaMoon,
  FaSun,
  FaYoutube,
} from "react-icons/fa";

import {
  FlexContainer,
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

export const ThemeToggle = () => {
  const { theme: currentTheme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) return null;

  return React.createElement(
    "button",
    {
      className:
        "flex items-center justify-center rounded-md p-[10px] text-foreground hover:bg-accent",
      onClick: toggleTheme,
      type: "button",
    },
    currentTheme === "dark"
      ? React.createElement(FaSun, { className: "h-[20px] w-[20px]" })
      : React.createElement(FaMoon, { className: "h-[20px] w-[21px]" }),
  );
};

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
}: MainNavbarProps = {}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [learningSidebarOpen, setLearningSidebarOpen] = useState(false);
  const { isVisible } = useScrollDirection(100);
  const { theme: currentTheme, toggleTheme, isMounted } = useTheme();

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
    return "bg-white dark:bg-[#050B18] transition-colors duration-300";
  };

  const finalDashboardRoute = dashboardRoute || variantConfig.dashboardRoute;

  const finalBranding =
    customBranding ||
    (variantConfig.productName
      ? React.createElement(
          NextLink,
          {
            href: finalDashboardRoute,
            className: "no-underline hover:opacity-90 transition-opacity",
          },
          React.createElement(ProductLogo, {
            productName: variantConfig.productName,
            subText: variantConfig.subText,
          }),
        )
      : variantConfig.branding);

  const borderClass =
    currentTheme === "dark"
      ? "border-0"
      : variantConfig.borderClass || "border";
  const shouldUseCustomActions = customActions && customActions.length > 0;
  const isLearningVariant = variant === "learning";

  const requiresAuth = variantConfig.requiresAuth !== false;
  const showGamification =
    requiresAuth && variantConfig.showGamification !== false;
  const showNotifications = variantConfig.showNotifications !== false;

  return React.createElement(
    FlexContainer,
    {
      as: "header",
      className: `fixed top-0 left-0 right-0 z-40 ${getBackgroundClass()} shadow-md shadow-white/5 dark:shadow-[0_1px_15px_rgba(255,255,255,0.1)] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`,
    },
    React.createElement(
      FlexContainer,
      {
        as: "nav",
        className: cn(
          "flex w-full items-center justify-between",
          compact ? "p-[6px] lg:px-[16px]" : "p-[12px] lg:px-[32px]",
          borderClass,
        ),
      },
      React.createElement(
        "div",
        { className: "flex items-center gap-[16px]" },
        showBackButton &&
          React.createElement(LinkButton, {
            href: backButtonHref,
            buttonProps: {
              variant: "OUTLINE",
              size: "SMALL",
              text: "← Back",
              className:
                "border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 py-[4px] px-[8px] h-auto whitespace-nowrap",
            },
          }),
        finalBranding,
        isLearningVariant &&
          React.createElement(
            "button",
            {
              className:
                "flex items-center justify-center rounded-md p-[6px] text-foreground hover:bg-accent",
              type: "button",
              onClick: () => setLearningSidebarOpen(true),
            },
            React.createElement(Bars3Icon, {
              "aria-hidden": "true",
              className: "h-[16px] w-[16px] text-foreground",
            }),
          ),
      ),
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "div",
          { className: "flex lg:hidden gap-[8px] items-center" },
          React.createElement(ThemeToggle),
          requiresAuth &&
            React.createElement(UserAvatar, {
              dashboardRoute: (finalDashboardRoute as string) || undefined,
            } as any),
          React.createElement(
            "button",
            {
              className:
                "flex items-center justify-center rounded-md p-[10px] text-foreground hover:bg-accent",
              type: "button",
              onClick: () => setMobileMenuOpen(true),
            },
            React.createElement(Bars3Icon, {
              "aria-hidden": "true",
              className: "h-[24px] w-[24px] text-foreground",
            }),
          ),
        ),
        showFullNavigation &&
          React.createElement(
            "div",
            { className: "hidden items-center lg:flex lg:gap-x-[24px]" },
            learnNav.visible &&
              React.createElement(
                PopoverContainer,
                {
                  isOpen: openPopover === "products",
                  label: "Learn",
                  onToggle: () => handleSetOpen("products"),
                  theme: currentTheme,
                } as any,
                React.createElement(NavbarDropdownContainer, {
                  links: learnNav.links,
                }),
              ),
            variantConfig.pricingNavLink &&
              React.createElement(
                FlexContainer,
                { direction: "col", itemCenter: false, justifyCenter: false },
                React.createElement(
                  Link,
                  {
                    className: `text-base ${currentTheme === "dark" ? "text-white/80" : "text-gray-700"} hover:text-primary transition-colors`,
                    href: variantConfig.pricingNavLink.href,
                  },
                  variantConfig.pricingNavLink.label,
                ),
              ),
            issuesNav.visible &&
              issuesNav.links[0]?.href &&
              React.createElement(
                FlexContainer,
                { direction: "col", itemCenter: false, justifyCenter: false },
                React.createElement(
                  Link,
                  {
                    className: `text-base ${currentTheme === "dark" ? "text-white/80" : "text-gray-700"} hover:text-primary whitespace-nowrap`,
                    href: issuesNav.links[0].href,
                    target: issuesNav.links[0]?.target,
                  },
                  issuesNav.links[0]?.name,
                ),
              ),
            toolsNav.visible &&
              React.createElement(
                PopoverContainer,
                {
                  isOpen: openPopover === "tools",
                  label: "Tools",
                  onToggle: () => handleSetOpen("tools"),
                  theme: currentTheme,
                } as any,
                React.createElement(NavbarDropdownContainer, {
                  links: toolsNav.links,
                }),
              ),
            linksNav.visible &&
              React.createElement(
                PopoverContainer,
                {
                  isOpen: openPopover === "links",
                  label: "Links",
                  panelClasses: "-left-6",
                  onToggle: () => handleSetOpen("links"),
                  theme: currentTheme,
                } as any,
                React.createElement(NavbarDropdownContainer, {
                  links: linksNav.links,
                }),
              ),
            React.createElement(ThemeToggle),
            requiresAuth &&
              showNotifications &&
              React.createElement(NotificationPopover),
            requiresAuth &&
              React.createElement(UserAvatar, {
                dashboardRoute: (finalDashboardRoute as string) || undefined,
              } as any),
            requiresAuth &&
              React.createElement(LoginRedirectButton, { text: "Login" }),
          ),
      ),
    ),
    React.createElement(
      Dialog,
      {
        as: "div",
        className: "lg:hidden",
        open: mobileMenuOpen,
        onClose: setMobileMenuOpen,
      },
      React.createElement("div", {
        className: "fixed inset-0 z-50 overflow-hidden",
      }),
      React.createElement(
        Dialog.Panel,
        {
          className:
            "fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-border transition-colors duration-300",
        },
        React.createElement(
          "div",
          { className: "flex items-center justify-between" },
          finalBranding,
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            React.createElement(ThemeToggle),
            React.createElement(
              "button",
              {
                className: "-m-2.5 rounded-md p-2.5 text-foreground",
                type: "button",
                onClick: () => setMobileMenuOpen(false),
              },
              React.createElement(XMarkIcon, {
                "aria-hidden": "true",
                className: "h-6 w-6",
              }),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "mt-6 flow-root" },
          React.createElement(
            "div",
            { className: "-my-6 divide-y divide-border" },
            React.createElement(
              FlexContainer,
              {
                className: "gap-2 space-y-2 py-6",
                direction: "col",
                itemCenter: false,
              },
              shouldUseCustomActions &&
                customActions.map((action: React.ReactNode, index: number) =>
                  React.createElement(
                    "div",
                    { key: index, className: "w-full" },
                    action,
                  ),
                ),
              requiresAuth &&
                React.createElement(
                  FlexContainer,
                  {
                    className: "gap-1",
                    direction: "col",
                    itemCenter: false,
                    justifyCenter: false,
                  },
                  React.createElement(LoginRedirectButton, { text: "Login" }),
                ),
              learnNav.visible &&
                React.createElement(MobileNavbarLinksContainer, {
                  links: learnNav.links,
                  title: "Learn",
                  onLinkClick: handleCloseMobileMenu,
                }),
              variantConfig.pricingNavLink &&
                React.createElement(
                  FlexContainer,
                  { className: "py-2", direction: "col", itemCenter: false },
                  React.createElement(
                    Link,
                    {
                      className:
                        "text-base font-medium text-foreground hover:text-primary",
                      href: variantConfig.pricingNavLink.href,
                      onClick: handleCloseMobileMenu,
                    },
                    variantConfig.pricingNavLink.label ?? "Pricing",
                  ),
                ),
              toolsNav.visible &&
                React.createElement(MobileNavbarLinksContainer, {
                  links: toolsNav.links,
                  title: "Tools",
                  onLinkClick: handleCloseMobileMenu,
                }),
              linksNav.visible &&
                React.createElement(MobileNavbarLinksContainer, {
                  links: linksNav.links,
                  title: "Links",
                  onLinkClick: handleCloseMobileMenu,
                }),
              React.createElement(
                FlexContainer,
                { className: "gap-2", itemCenter: false, justifyCenter: false },
                requiresAuth &&
                  showNotifications &&
                  React.createElement(NotificationPopover),
                showGamification && React.createElement(UserPointButton),
              ),
              React.createElement(
                FlexContainer,
                {
                  className: "gap-1",
                  direction: "col",
                  itemCenter: false,
                  justifyCenter: false,
                },
                React.createElement(
                  Text,
                  {
                    className: "pre-title text-muted-foreground",
                    level: "span",
                  } as any,
                  "Connect with us",
                ),
                React.createElement(
                  FlexContainer,
                  {
                    className: "gap-3 py-2",
                    itemCenter: false,
                    justifyCenter: false,
                  },
                  React.createElement(
                    Link,
                    { href: LINKS.instagram, target: "_blank" },
                    React.createElement(FaInstagram, {
                      className: "text-foreground",
                      size: "1.5em",
                    }),
                  ),
                  React.createElement(
                    Link,
                    { href: LINKS.youtube, target: "_blank" },
                    React.createElement(FaYoutube, {
                      className: "text-foreground",
                      size: "1.5em",
                    }),
                  ),
                  React.createElement(
                    Link,
                    { href: LINKS.officialLinkedIn, target: "_blank" },
                    React.createElement(FaLinkedin, {
                      className: "text-foreground",
                      size: "1.5em",
                    }),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};

export default Navbar;
