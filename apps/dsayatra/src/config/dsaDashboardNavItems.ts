import type { LucideIcon } from "lucide-react";
import {
  Brain,
  ClipboardList,
  FileText,
  Home,
  Target,
  TrendingUp,
} from "lucide-react";

export type DsaDashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Single source of truth for DSA Yatra app shell navigation (sidebar + mobile bar).
 */
export const DSA_DASHBOARD_NAV_ITEMS: DsaDashboardNavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sheets", href: "/sheets", icon: Target },
  { name: "Revisions", href: "/revisions", icon: FileText },
  { name: "Topics", href: "/topics", icon: ClipboardList },
  { name: "Pattern Quiz", href: "/pattern-quiz", icon: Brain },
  {
    name: "Progress",
    href: "/dashboard#overall-progress",
    icon: TrendingUp,
  },
];
