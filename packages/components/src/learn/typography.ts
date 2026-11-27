/**
 * Semantic typography tokens for the Learning Dashboard and shared learning spaces.
 * Built from standard Tailwind CSS utilities so every monorepo app
 * (@tbe/platform, @tbe/oncampus, etc.) compiles them without custom config drift.
 *
 * All foreground/muted color pairs target WCAG AA (>= 4.5:1) in both light and dark modes.
 */
export const LEARN_TYPOGRAPHY = {
  /** Page or active chapter/question title (20px -> 24px -> 26px) */
  pageHeading:
    "text-xl sm:text-2xl md:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight",

  /** Space/banner header title (20px -> 24px) */
  spaceHeading:
    "text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight",

  /** Section heading (18px -> 20px) */
  sectionHeading:
    "text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug",

  /** Card title base (16px -> 18px, color-agnostic for explicit light/dark theme props) */
  cardTitleBase: "text-base sm:text-lg font-semibold leading-snug",

  /** Card title (16px -> 18px) */
  cardTitle:
    "text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-snug",

  /** Compact catalog card title (15px -> 16px) */
  compactCardTitle:
    "text-[15px] sm:text-base font-bold text-slate-900 dark:text-white leading-snug",

  /** Body copy, course/sheet descriptions, and MDX reader baseline (15px -> 16px) */
  body: "text-[15px] sm:text-base font-normal text-slate-700 dark:text-slate-300 leading-relaxed",

  /** Reader container for MDX course/sheet content (15px -> 16px) */
  readerBody:
    "text-[15px] sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans",

  /** Card description base (14px -> 15px, color-agnostic for explicit light/dark theme props) */
  cardDescriptionBase: "text-sm sm:text-[15px] font-normal leading-relaxed",

  /** Card description copy (14px -> 15px, relaxed line-height) */
  cardDescription:
    "text-sm sm:text-[15px] font-normal text-slate-600 dark:text-slate-300 leading-relaxed",

  /** Sidebar / navigation item label (14px) */
  navItem: "text-sm leading-normal",
  navItemActive: "font-semibold text-slate-900 dark:text-white",
  navItemIdle: "font-medium text-slate-700 dark:text-slate-200",

  /** Sidebar section header (14px -> 16px) */
  sidebarHeading:
    "text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug",

  /** Muted metadata, breadcrumbs, counts, and supporting info (13px -> 14px, WCAG AA >= 4.5:1) */
  meta: "text-[13px] sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-normal",

  /** Tiny progress/status metadata such as "Solved" and "12 / 40" (11px -> 12px, WCAG AA) */
  microMeta:
    "text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 leading-normal",

  /** Compact badge/pill label (12px, color-agnostic for themed badge backgrounds) */
  badge: "text-xs font-bold tracking-wider uppercase",

  /** Compact button/control label (13px -> 14px, color-agnostic) */
  control: "text-[13px] sm:text-sm font-bold",

  /** Small uppercase section label inside sidebars (11px, WCAG AA >= 4.5:1) */
  sidebarGroupLabel:
    "text-[11px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400",

  /** Search input text inside learning spaces (14px) */
  input:
    "text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400",
} as const;

export type LearnTypographyToken = keyof typeof LEARN_TYPOGRAPHY;
