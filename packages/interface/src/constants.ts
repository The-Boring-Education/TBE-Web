 interface OutlineCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface CelebrationAnimationProps {
    show: boolean
    pointsEarned?: number
    onComplete?: () => void
}

interface GamificationBadgeProps {
    userId?: string
    className?: string
}

interface NavbarDropdownLink {
  id: string;
  name: string;
  href: string;
  description: string;
  target?: '_blank';
  isDevelopment?: boolean;
}

interface NavbarDropdownContainerProps {
  links: NavbarDropdownLink[];
}

interface NavbarProps {
    username: string
    onSignOut: () => void
    userId?: string
}

export type {
    CelebrationAnimationProps,
    GamificationBadgeProps,
    NavbarDropdownContainerProps,
    NavbarDropdownLink,
    NavbarProps,
    OutlineCardProps
};