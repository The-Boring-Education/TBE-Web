'use client'

import { useEffect, useRef,useState } from 'react'

import { useGamificationContext } from './context/GamificationContext'
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
        {/* Simple red circle with white text */}
        <button
          onClick={handlePointsClick}
          className="w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-colors shadow-md"
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

  // Dashboard variant - simple red circle
  return (
    <>
      <div className="relative" ref={containerRef}>
        {/* Simple red circle with white text */}
        <button
          onClick={handlePointsClick}
          className="w-14 h-14 bg-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-colors shadow-lg"
        >
          <span className="text-white font-bold text-base">
            {loading ? '...' : points}
          </span>
        </button>
        
        {showCard && (
          <GamificationCard 
            userId={userId}
            isOpen={showCard}
            onClose={handleCloseCard}
          />
        )}
      </div>
    </>
  )
}
