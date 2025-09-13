'use client'

import { GamificationProvider } from '@/contexts/GamificationContext'
import { useAuth } from '@/contexts/AuthContext'

interface GamificationWrapperProps {
  children: React.ReactNode
}

export function GamificationWrapper({ children }: GamificationWrapperProps) {
  const { user } = useAuth()
  
  return (
    <GamificationProvider userId={user?.id}>
      {children}
    </GamificationProvider>
  )
}
