'use client'

import { Brain, Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                The Boring Quizes
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Master tech interviews with curated questions and detailed explanations.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 text-sm">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/performance" className="text-gray-600 hover:text-indigo-600 text-sm">
                                    Performance
                                </a>
                            </li>
                            <li>
                                <a href="/leaderboard" className="text-gray-600 hover:text-indigo-600 text-sm">
                                    Leaderboard
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                            Connect
                        </h4>
                        <div className="flex space-x-3">
                            <a 
                                href="https://github.com/orgs/The-Boring-Education" 
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://www.linkedin.com/company/theboringeducation/" 
                                className="text-gray-400 hover:text-indigo-600 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                        <p className="text-gray-600 text-sm mt-4">
                            By The Boring Education
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            © {currentYear} The Boring Education. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}