interface OutlineCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface CelebrationAnimationProps {
  show: boolean;
  pointsEarned?: number;
  onComplete?: () => void;
}

interface GamificationBadgeProps {
  userId?: string;
  className?: string;
}

interface NavbarDropdownLink {
  id: string;
  name: string;
  href: string;
  description: string;
  target?: "_blank";
  isDevelopment?: boolean;
}

interface NavbarDropdownContainerProps {
  links: NavbarDropdownLink[];
}

interface NavbarProps {
  onSignOut: () => void;
  userId?: string;
}

export type NavbarVariant =
  | "default"
  | "transparent"
  | "prepyatra"
  | "quizes"
  | "techyatra"
  | "dsayatra"
  | "resume-yatra"
  | "oncampus"
  | "learning";

interface MainNavbarProps extends Partial<NavbarProps> {
  variant?: NavbarVariant;
  showFullNavigation?: boolean;
  customBranding?: React.ReactNode;
  customActions?: React.ReactNode[];
  dashboardRoute?: string;
  theme?: "light" | "dark";
  totalChapters?: number;
  completedChapters?: number;
  sidebarTitle?: string;
  sidebarContent?: React.ReactNode;
  showBackButton?: boolean;
  backButtonHref?: string;
}
/**
 * Controls visibility of a single navbar section.
 * - `true`     → show all links in the section
 * - `false`    → hide the section entirely
 * - `string[]` → show only links whose IDs are in the array
 */
type NavbarSectionVisibility = boolean | string[];

/**
 * Per-section navigation visibility config.
 * Sections not specified default to `true` (visible with all links).
 */
interface NavbarNavigationConfig {
  issues?: NavbarSectionVisibility;
  cohorts?: NavbarSectionVisibility;
  learn?: NavbarSectionVisibility;
  tools?: NavbarSectionVisibility;
  links?: NavbarSectionVisibility;
}

interface NavbarVariantConfig {
  branding?: React.ReactNode;
  productName?: string;
  subText?: string;
  dashboardRoute: string;
  borderClass?: string;
  requiresAuth?: boolean;
  showGamification?: boolean;
  showNotifications?: boolean;
  navigation?: NavbarNavigationConfig;
}

export type FooterVariant =
  | "default"
  | "prepyatra"
  | "quizes"
  | "techyatra"
  | "dsayatra"
  | "resumeyatra"
  | "platform"
  | "oncampus";

interface FooterProps {
  variant?: FooterVariant;
  isMini?: boolean;
}

type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

type DsaSectionTabs = "description" | "topics" | "companies" | "code";

export type {
  CelebrationAnimationProps,
  DsaSectionTabs,
  FooterProps,
  GamificationBadgeProps,
  MainNavbarProps,
  NavbarDropdownContainerProps,
  NavbarDropdownLink,
  NavbarNavigationConfig,
  NavbarProps,
  NavbarSectionVisibility,
  NavbarVariantConfig,
  OutlineCardProps,
  QuestionDifficulty,
};
