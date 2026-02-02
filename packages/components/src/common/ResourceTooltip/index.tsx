import type { ResourceItem } from '@tbe/types'
import { useEffect, useRef, useState } from 'react'
import { FaBook, FaCode, FaYoutube } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'

import Button from '../Buttons/Button'

export interface ResourceTooltipProps {
    resources?: ResourceItem[]
    theme?: 'light' | 'dark'
    className?: string
}

const ResourceTooltip = ({
    resources,
    theme = 'dark',
    className = '',
}: ResourceTooltipProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const isDark = theme === 'dark'

    // Check if any resources exist
    const hasResources = resources && resources.length > 0

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    if (!hasResources) {
        return null
    }

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'YOUTUBE':
                return { icon: <FaYoutube className='w-3 h-3' />, label: 'YouTube', color: 'text-red-500' }
            case 'LEETCODE':
                return { icon: <SiLeetcode className='w-3 h-3' />, label: 'LeetCode', color: 'text-amber-500' }
            case 'CODE':
                return { icon: <FaCode className='w-3 h-3' />, label: 'Code', color: 'text-emerald-500' }
            case 'BLOG':
            default:
                return { icon: <FaBook className='w-3 h-3' />, label: 'Blog', color: 'text-blue-500' }
        }
    }

    const filteredResources = resources?.filter((item) => item.url) || []

    const handleResourceClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer')
        setIsOpen(false)
    }

    return (
        <div ref={dropdownRef} className={`relative inline-block ${className}`}>
            {/* Dropdown - Opens on TOP */}
            {isOpen && (
                <div
                    className={`
            absolute bottom-full left-0 mb-1 z-50
            rounded shadow-md border
            ${isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }
          `}
                >
                    {filteredResources.map((item, index) => {
                        const { icon, label, color } = getResourceIcon(item.type)
                        return (
                            <button
                                key={index}
                                type='button'
                                onClick={() => handleResourceClick(item.url)}
                                className={`
                w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left whitespace-nowrap
                transition-colors duration-100 cursor-pointer
                ${index === 0 ? 'rounded-t' : ''}
                ${index === filteredResources.length - 1 ? 'rounded-b' : ''}
                ${isDark
                                        ? 'text-gray-200 hover:bg-gray-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
              `}
                            >
                                <span className={color}>{icon}</span>
                                <span>{item.label || label}</span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Trigger Button - Using TBE Button Component (MEDIUM size to match other buttons) */}
            <Button
                variant='SECONDARY'
                size='MEDIUM'
                onClick={() => setIsOpen(!isOpen)}
                text='View Resources'
            />
        </div>
    )
}

export default ResourceTooltip
