'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@tbe/auth'
import { 
    Brain, 
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
    const getInitials = (name: string) => {
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

                    {/* User Actions (Profile + Auth) */}
                    {isLoading ? (
                        <div className="flex items-center space-x-4">
                            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded" />
                        </div>
                    ) : user ? (
                        <div className="relative p-0 w-10 h-10 rounded-[50%] border-[2px] overflow-hidden">
                            <div
                                className="text-white/90 outline-none p-0 w-full h-full"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <Avatar className="h-9 w-9 rounded-full">
                                    <AvatarImage src={user?.image} alt={user?.name} className="h-9 w-9 rounded-full object-cover"/>
                                    <AvatarFallback>
                                        {user?.name ? getInitials(user.name) : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                    <Button
                                        variant="GHOST"
                                        onClick={() => {
                                            router.push('/dashboard');
                                            setShowUserMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-primary/10"
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        variant="GHOST"
                                        onClick={handleSignOut}
                                        disabled={loading}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                                    >
                                        {loading ? "Signing out..." : "Sign Out"}
                                    </Button>
                                </div>
                            )}
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
