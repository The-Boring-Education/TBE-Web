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
  | "resume-yatra";

interface MainNavbarProps extends Partial<NavbarProps> {
  variant?: NavbarVariant;
  showFullNavigation?: boolean;
  customBranding?: React.ReactNode;
  customActions?: React.ReactNode[];
  dashboardRoute?: string;
}
interface VariantConfig {
  branding: React.ReactNode;
  dashboardRoute: string;
  borderClass?: string;
  requiresAuth?: boolean; // If false, hides UserPointButton and UserAvatar
  showGamification?: boolean; // If false, hides UserPointButton (gamification)
}

export type FooterVariant =
  | "default"
  | "prepyatra"
  | "quizes"
  | "techyatra"
  | "dsayatra"
  | "resumeyatra"
  | "platform";

interface FooterProps {
  variant?: FooterVariant;
}

export type {
  CelebrationAnimationProps,
  GamificationBadgeProps,
  NavbarDropdownContainerProps,
  NavbarDropdownLink,
  NavbarProps,
  MainNavbarProps,
  OutlineCardProps,
  VariantConfig,
  FooterProps,
};
