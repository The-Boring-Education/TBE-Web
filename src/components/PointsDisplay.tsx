'use client'

import { useGamificationContext } from '@/contexts/GamificationContext'
import { useState, useEffect, useRef } from 'react'
import { GamificationCard } from './GamificationCard'

interface PointsDisplayProps {
  userId?: string
  variant?: 'navbar' | 'dashboard'
}

export function PointsDisplay({ userId, variant = 'navbar' }: PointsDisplayProps) {
  const { points, loading, currentLevel, pointsToNextLevel } = useGamificationContext()
  const [showCard, setShowCard] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointsClick = () => {
    setShowCard(true)
  }

  const handleCloseCard = () => {
    setShowCard(false)
  }

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCard(false)
      }
    }

    if (showCard) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCard])

  if (variant === 'navbar') {
    return (
      <div className="relative" ref={containerRef}>
        {/* Simple red circle with points */}
        <button
          onClick={handlePointsClick}
          className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <span className="text-white font-bold text-sm">
            {loading ? '...' : points}
          </span>
        </button>
        
        {showCard && (
          <GamificationCard 
            userId={userId}
            isOpen={showCard}
            onClose={handleCloseCard}
            variant="popup"
          />
        )}
      </div>
    )
  }

  // Dashboard variant - more detailed display
  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Points circle */}
        <button
          onClick={handlePointsClick}
          className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <span className="text-white font-bold">
            {loading ? '...' : points}
          </span>
        </button>
        
        {/* Level info */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            Level {currentLevel.level}: {currentLevel.name}
          </span>
          {pointsToNextLevel > 0 && (
            <span className="text-xs text-gray-500">
              {pointsToNextLevel} to next level
            </span>
          )}
        </div>
      </div>
      
      <GamificationCard 
        userId={userId}
        isOpen={showCard}
        onClose={handleCloseCard}
      />
    </>
  )
}
