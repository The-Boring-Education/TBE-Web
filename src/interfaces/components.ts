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
  name: string;
  href: string;
  description: string;
  target?: string;
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
    NavbarProps
};