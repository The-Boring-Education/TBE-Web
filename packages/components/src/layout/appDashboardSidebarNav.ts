/**
 * Shared styling for app dashboard shells (e.g. OnCampus).
 * Keep in sync with SidebarMenuButton usage in DashboardLayout.
 */
export const APP_DASHBOARD_SIDEBAR_BUTTON_CLASS =
  "text-gray-300 p-4 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#FF5757] data-[active=true]:text-white";

/** DSA Yatra desktop rail — aligned with dashboard cards (charcoal, coral accent). */
export const DSA_YATRA_SIDEBAR_MENU_BUTTON_CLASS =
  "h-auto min-h-11 gap-3 rounded-xl border border-transparent bg-transparent px-3 py-2.5 text-[13px] font-semibold tracking-tight " +
  "text-[#a3a3a3] shadow-none " +
  "hover:border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-[#f0f0f0] " +
  "data-[active=true]:border-transparent data-[active=true]:bg-transparent data-[active=true]:shadow-none " +
  "data-[active=true]:font-bold data-[active=true]:text-[#ff5757] " +
  "data-[active=true]:hover:bg-[#1a1a1a] data-[active=true]:hover:text-[#ff5757] " +
  "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-[#ff5757]/70 " +
  "data-[active=true]:[&>svg]:text-[#ff5757] " +
  "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#ff5757]/35 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[#101010]";

const hashFromHref = (href: string): string | null => {
  const i = href.indexOf("#");
  if (i === -1) return null;
  return href.slice(i + 1);
};

const pathWithoutHash = (href: string): string => {
  const i = href.indexOf("#");
  return i === -1 ? href : href.slice(0, i);
};

/**
 * Active state for left sidebar links (dashboard area, nested routes, hash sections).
 */
export function isDashboardSidebarLinkActive(
  pathname: string,
  asPath: string,
  href: string,
): boolean {
  const hrefHash = hashFromHref(href);
  if (hrefHash) {
    const base = pathWithoutHash(href);
    return pathname === base && asPath.includes(`#${hrefHash}`);
  }

  if (href === "/pricing") {
    return pathname === "/pricing";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
