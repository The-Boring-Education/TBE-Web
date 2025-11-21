'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@tbe/auth'
import { 
    Brain, 
    LogOut, 
    ChevronDown,
    BarChart3,
    Trophy,
    Home
} from 'lucide-react'
import { Button } from '@tbe/components'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useToast } from './ui/use-toast'


export function Navbar() {
    const { user, signOut, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignOut = async () => {
        try {
            setLoading(true)
            await signOut()
            setShowUserMenu(false)
            router.push('/login')
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

        const getInitials = (name: string = "") => {
        return name
            .trim()
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
        };


    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Performance', href: '/performance', icon: BarChart3 },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div 
                        className="flex items-center cursor-pointer" 
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="w-10 h-10 bg-[#ef4444] rounded-lg flex items-center justify-center mr-4">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                The Boring Quizes
                            </h1>
                            <p className="text-xs text-gray-500">
                                By The Boring Education
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links - Always visible for authenticated users */}
                    {user && (
                        <nav className="flex items-center space-x-4">
                            {navItems.map((item) => (
                                <Button
                                    key={item.name}
                                    variant={isActive(item.href) ? "PRIMARY" : "GHOST"}
                                    onClick={() => router.push(item.href)}
                                    className={`flex items-center space-x-2 rounded-md ${
                                        isActive(item.href) 
                                            ? 'bg-primary text-white ' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </Button>
                            ))}
                        </nav>
                    )}

                    {/* Points Display */}
                    {/* {user && (
                        <PointsDisplay userId={user.id} variant="navbar" />
                    )} */}

                    {/* User Menu */}
                    {isLoading ? (
                        <div className="flex items-center space-x-4">
                            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded" />
                        </div>
                    ) : user ? (
                        <div className="flex items-center space-x-4">
                            {/* Mobile Navigation */}
                            <div className="md:hidden">
                                <Button
                                    variant="GHOST"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="p-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </Button>
                            </div>

                            {/* User Profile */}
                            <div className="relative">
                                <Button
                                    variant="OUTLINE"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-3 h-10 border-gray-200 hover:border-[#ef4444]"
                                    disabled={loading}
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={user?.image} alt={user?.name} />
                                        <AvatarFallback className="text-xs bg-red-100 text-[#ef4444] font-bold">
                                            {user?.name ? getInitials(user.name) : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium hidden sm:block text-gray-700">
                                        {user?.name}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </Button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        {/* Mobile Navigation Links */}
                                        <div className="md:hidden border-b border-gray-100">
                                            {navItems.map((item) => (
                                                <Button
                                                    key={item.name}
                                                    variant="GHOST"
                                                    onClick={() => {
                                                        router.push(item.href)
                                                        setShowUserMenu(false)
                                                    }}
                                                    className={`w-full justify-start ${
                                                        isActive(item.href) ? 'bg-red-50 text-[#ef4444] font-semibold' : 'text-gray-600'
                                                    }`}
                                                >
                                                    <item.icon className="w-4 h-4 mr-2" />
                                                    {item.name}
                                                </Button>
                                            ))}
                                        </div>
                                        
                                        <div className="py-2">
                                            <Button
                                                variant="GHOST"
                                                onClick={handleSignOut}
                                                disabled={loading}
                                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                {loading ? "Signing out..." : "Sign Out"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="GHOST"
                                onClick={() => router.push('/login')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Sign In
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}