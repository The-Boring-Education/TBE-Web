'use client'

import { useAuth } from '@tbe/auth'

import { Footer } from './Footer'
import { Navbar } from './Navbar'

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
            <main className={`flex-grow ${showNavbar ? 'pt-20' : ''}`}>
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    )
}