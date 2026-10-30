import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  BookOpen,
  Compass,
  FileText,
  Home,
  Trophy,
} from "lucide-react";

export type DsaDashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Single source of truth for DSA Yatra / DSA Vault app shell navigation.
 */
export const DSA_DASHBOARD_NAV_ITEMS: DsaDashboardNavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Problem Sheets", href: "/sheets", icon: FileText },
  { name: "Roadmaps", href: "/topics", icon: Compass },
  { name: "Notes", href: "/revisions", icon: BookOpen },
  { name: "Contests", href: "/pattern-quiz", icon: Trophy },
  { name: "Bookmarks", href: "/sheets", icon: Bookmark },
];
