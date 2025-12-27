/**
 * Testing App Homepage
 *
 * Links to SEO Inspector and other testing tools
 */

import Link from 'next/link';
import Head from 'next/head';

export default function HomePage() {
    return (
        <>
            <Head>
                <title>TBE Testing Suite</title>
                <meta
                    name="description"
                    content="Testing and QA tools for TBE Platform"
                />
            </Head>

            <main className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-12 px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        TBE Testing Suite
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Testing and QA tools for The Boring Education Platform
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* SEO Inspector Card */}
                        <Link
                            href="/seo"
                            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    SEO Inspector
                                </h2>
                            </div>
                            <p className="text-gray-600 text-sm">
                                View Lighthouse reports, validate meta tags,
                                and monitor SEO scores across all TBE apps.
                            </p>
                        </Link>

                        {/* Unit Tests Card */}
                        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 opacity-60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Unit Tests
                                </h2>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Run unit tests via CLI:{' '}
                                <code className="bg-gray-100 px-1 rounded">
                                    pnpm test:unit
                                </code>
                            </p>
                        </div>

                        {/* E2E Tests Card */}
                        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 opacity-60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-purple-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    E2E Tests
                                </h2>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Run E2E tests via CLI:{' '}
                                <code className="bg-gray-100 px-1 rounded">
                                    pnpm test:e2e
                                </code>
                            </p>
                        </div>

                        {/* API Tests Card */}
                        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 opacity-60">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-orange-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    API Tests
                                </h2>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Run API tests via CLI:{' '}
                                <code className="bg-gray-100 px-1 rounded">
                                    pnpm test:api
                                </code>
                            </p>
                        </div>
                    </div>

                    {/* Quick Commands */}
                    <div className="mt-12 p-6 bg-gray-900 rounded-lg text-white">
                        <h3 className="text-lg font-semibold mb-4">
                            Quick Commands
                        </h3>
                        <div className="space-y-2 font-mono text-sm">
                            <div className="flex gap-4">
                                <span className="text-gray-400 w-40">
                                    Run SEO Audit:
                                </span>
                                <span className="text-green-400">
                                    pnpm seo:audit
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-gray-400 w-40">
                                    SEO Audit (Prod):
                                </span>
                                <span className="text-green-400">
                                    pnpm seo:audit:prod
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-gray-400 w-40">
                                    All Tests:
                                </span>
                                <span className="text-green-400">
                                    pnpm test:ci
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

