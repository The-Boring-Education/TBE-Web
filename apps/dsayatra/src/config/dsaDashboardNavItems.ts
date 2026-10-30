import type { LucideIcon } from "lucide-react";
import { BookOpen, Brain, FileText, Home, Layers } from "lucide-react";

export type DsaDashboardNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Single source of truth for DSA Yatra navigation.
 */
export const DSA_DASHBOARD_NAV_ITEMS: DsaDashboardNavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sheets", href: "/sheets", icon: FileText },
  { name: "Revisions", href: "/revisions", icon: BookOpen },
  { name: "Topics", href: "/topics", icon: Layers },
  { name: "Pattern Quiz", href: "/pattern-quiz", icon: Brain },
];
