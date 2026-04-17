/**
 * Shared styling for app dashboard shells (e.g. OnCampus, DSA Yatra).
 * Keep in sync with SidebarMenuButton usage in DashboardLayout / DsaDashboardLayout.
 */
export const APP_DASHBOARD_SIDEBAR_BUTTON_CLASS =
  "text-gray-300 p-4 hover:text-white hover:bg-gray-800 data-[active=true]:bg-[#FF5757] data-[active=true]:text-white";

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
  options?: { dashboardHomeHref?: string; dashboardHashId?: string },
): boolean {
  const dashboardHome = options?.dashboardHomeHref ?? "/dashboard";
  const hashId = options?.dashboardHashId ?? "overall-progress";

  const hrefHash = hashFromHref(href);
  if (hrefHash) {
    const base = pathWithoutHash(href);
    return pathname === base && asPath.includes(`#${hrefHash}`);
  }

  if (href === dashboardHome) {
    return pathname === dashboardHome && !asPath.includes(`#${hashId}`);
  }

  if (href === "/pricing") {
    return pathname === "/pricing";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
