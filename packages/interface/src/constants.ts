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
interface NavbarVariantConfig {
  branding?: React.ReactNode;
  productName?: string;
  subText?: string;
  dashboardRoute: string;
  borderClass?: string;
  requiresAuth?: boolean; // If false, hides UserPointButton and UserAvatar
  showGamification?: boolean; // If false, hides UserPointButton (gamification)
  showCohorts?: boolean; // If false, hides Cohorts section
  showLearn?: boolean; // If false, hides Learn section
  showNotifications?: boolean; // If false, hides Notification section
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
}

type QuestionDifficulty =
  "EASY" | "MEDIUM" | "HARD"


type DsaSectionTabs = "description" | "topics" | "companies" | "code";


export type {
  CelebrationAnimationProps,
  DsaSectionTabs,
  FooterProps,
  GamificationBadgeProps,
  MainNavbarProps,
  NavbarDropdownContainerProps,
  NavbarDropdownLink,
  NavbarProps,
  NavbarVariantConfig,
  OutlineCardProps,
  QuestionDifficulty
};
