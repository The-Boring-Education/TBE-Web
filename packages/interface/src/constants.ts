interface OutlineCardProps {
    icon?: React.ReactNode
    title: string
    description: string
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
    id: string
    name: string
    href: string
    description: string
    target?: "_blank"
    isDevelopment?: boolean
}

interface NavbarDropdownContainerProps {
    links: NavbarDropdownLink[]
}

interface NavbarProps {
    onSignOut: () => void
    userId?: string
}


interface MainNavbarProps extends Partial<NavbarProps> {
    variant?: 'default' | 'transparent' | 'prepyatra';
    showFullNavigation?: boolean;
    // Custom branding component (replaces Logo) - only used if variant doesn't provide it
    customBranding?: React.ReactNode;
    // Custom actions/components to show in navbar (right side) - only used if variant doesn't provide it
    customActions?: React.ReactNode[];
    // Dashboard route for UserAvatar - only used if variant doesn't provide it
    dashboardRoute?: string;
}

export type {
    CelebrationAnimationProps,
    GamificationBadgeProps,
    NavbarDropdownContainerProps,
    NavbarDropdownLink,
    NavbarProps,
    MainNavbarProps,
    OutlineCardProps,
}
