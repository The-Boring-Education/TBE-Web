// Layout Components
export { DashboardNav } from './layout/DashboardNav'

// Common Components
export { ProtectedRoute } from './ProtectedRoute'
export { ClientAuth } from './ClientAuth'

// UI Components
export { Button } from './ui/button'
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
export { Input } from './ui/input'
export { Badge } from './ui/badge'
export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
export { useToast } from './ui/use-toast'
export { Toaster } from './ui/toaster' 

export { Layout } from './Layout'
export { Progress } from './ui/progress'
export { CodeRenderer } from './common/CodeRenderer'
export { MarkdownRenderer } from './common/MarkdownRenderer'

// Auth exports moved to @tbe/auth package
export { useGamificationContext } from './context/GamificationContext'
export { GamificationWrapper } from './GamificationWrapper'