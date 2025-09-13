'use client'

import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAuth } from '@/contexts/AuthContext'

interface LayoutProps {
    children: React.ReactNode
    showNavbar?: boolean
    showFooter?: boolean
}

export function Layout({ children, showNavbar = true, showFooter = true }: LayoutProps) {
    const { user } = useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            {showNavbar && <Navbar />}
            <main className="flex-grow">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    )
}