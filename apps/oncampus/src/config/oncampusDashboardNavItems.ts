import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BrainCircuit,
  ClipboardList,
  FileText,
  Home,
  Target,
} from "lucide-react";

export type OncampusDashboardNavItem = {
  name: string;
  /** Shorter label for the mobile bottom bar when space is tight */
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Single source of truth for On Campus app shell navigation (sidebar + mobile bar).
 */
export const ONCAMPUS_DASHBOARD_NAV_ITEMS: OncampusDashboardNavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  {
    name: "Sheets",
    shortLabel: "Sheets",
    href: "/interview-sheets",
    icon: Target,
  },
  { name: "DSA", href: "/sheets", icon: FileText },
  { name: "Quizzes", href: "/dashboard/quizzes", icon: ClipboardList },
  { name: "Aptitude", href: "/aptitude", icon: BrainCircuit },
  {
    name: "Core Subjects",
    shortLabel: "Subjects",
    href: "/coresubjects",
    icon: BookOpen,
  },
];
