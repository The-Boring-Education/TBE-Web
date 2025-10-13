'use client'

import { GamificationProvider } from './context/GamificationContext'
import { useAuth } from '@tbe/auth'

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
