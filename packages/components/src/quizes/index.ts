// Layout Components
export { DashboardNav } from './layout/DashboardNav'

// Common Components
export { ClientAuth } from './ClientAuth'
export { ProtectedRoute } from './ProtectedRoute'

// UI Components
export { CodeRenderer } from './common/CodeRenderer'
export { MarkdownRenderer } from './common/MarkdownRenderer'
export { Layout } from './Layout'
export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
export { Badge } from './ui/badge'
export { Button } from './ui/button'
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
export { Input } from './ui/input'
export { Progress } from './ui/progress'
export { Toaster } from './ui/toaster' 
export { useToast } from './ui/use-toast'

// Auth exports moved to @tbe/auth package
export { useGamificationContext } from './context/GamificationContext'
export { GamificationWrapper } from './GamificationWrapper'
export { default as QueryProvider } from './QueryProvider'