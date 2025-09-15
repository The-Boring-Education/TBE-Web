'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
    Brain, 
    LogOut, 
    ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { PointsDisplay } from '@/components/PointsDisplay'



export function DashboardNav() {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignOut = async () => {
        try {
            setLoading(true)
            await signOut()
            setShowUserMenu(false)
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
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }



    return (
        <header className="glass border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center animate-fade-in">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                            <Brain className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                The Boring Quizes
                            </h1>
                            <p className="text-xs text-black">
                                By The Boring Education
                            </p>
                        </div>
                    </div>

                    {/* Points Display */}
                    <PointsDisplay userId={user?.id} variant="dashboard" />

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* User Profile */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 h-10"
                                disabled={loading}
                            >
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user?.image} alt={user?.name} />
                                    <AvatarFallback className="text-xs">
                                        {user?.name ? getInitials(user.name) : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium hidden sm:block">
                                    {user?.name}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 glass-dark rounded-lg shadow-lg border z-50">
                                    <div className="py-2">
                                        <Button
                                            variant="ghost"
                                            onClick={handleSignOut}
                                            disabled={loading}
                                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            {loading ? "Signing out..." : "Sign Out"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </header>
    )
} 