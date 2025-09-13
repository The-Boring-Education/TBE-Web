import React from 'react'
import { Button, Logo, UserAvatar, UserPointButton } from '@tbe/ui'
import { useUser } from '@tbe/hooks'

interface StandardizedNavbarProps {
  appName?: string
  showUserPoints?: boolean
  customActions?: React.ReactNode
  variant?: 'platform' | 'prep-yatra' | 'quizes' | 'onboarding'
}

/**
 * Standardized Navbar Component
 * 
 * Provides consistent navigation across all TBE apps while allowing customization
 * Based on the platform (tbe-webapp) baseline design
 */
export default function StandardizedNavbar({ 
  appName, 
  showUserPoints = false, 
  customActions,
  variant = 'platform'
}: StandardizedNavbarProps) {
  const { user, loading } = useUser()

  const getAppSpecificStyles = () => {
    switch (variant) {
      case 'prep-yatra':
        return 'bg-primary-50 border-primary-200'
      case 'quizes':
        return 'bg-purple-50 border-purple-200'
      case 'onboarding':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getAppSpecificLinks = () => {
    switch (variant) {
      case 'prep-yatra':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/challenges', label: 'Challenges' },
          { href: '/prep-logs', label: 'Prep Logs' },
          { href: '/recruiters', label: 'Recruiters' }
        ]
      case 'quizes':
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/quiz', label: 'Take Quiz' },
          { href: '/results', label: 'Results' },
          { href: '/leaderboard', label: 'Leaderboard' }
        ]
      case 'onboarding':
        return [
          { href: '/', label: 'Home' },
          { href: '/onboarding', label: 'Get Started' }
        ]
      default:
        return [
          { href: '/', label: 'Home' },
          { href: '/projects', label: 'Projects' },
          { href: '/interview-prep', label: 'Interview Prep' },
          { href: '/shiksha', label: 'Shiksha' }
        ]
    }
  }

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-sm ${getAppSpecificStyles()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-4">
            <Logo className="h-8 w-auto" />
            {appName && (
              <span className="text-lg font-semibold text-gray-900">
                {appName}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {getAppSpecificLinks().map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {customActions}
            
            {showUserPoints && user && (
              <UserPointButton />
            )}

            {loading ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <UserAvatar user={user} />
            ) : (
              <Button variant="default" size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
