/**
 * SEO Validator Page
 *
 * Validate meta tags and SEO elements for any URL
 */

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

interface MetaTag {
    name: string;
    content: string;
    status: 'present' | 'missing' | 'warning';
    recommendation?: string;
}

interface ValidationResult {
    url: string;
    title: string;
    description: string;
    metaTags: MetaTag[];
    issues: string[];
    score: number;
    isSSR: boolean;
}

function StatusBadge({ status }: { status: MetaTag['status'] }) {
    const styles = {
        present: 'bg-green-100 text-green-700',
        missing: 'bg-red-100 text-red-700',
        warning: 'bg-yellow-100 text-yellow-700'
    };

    const labels = {
        present: 'OK',
        missing: 'Missing',
        warning: 'Warning'
    };

    return (
        <span
            className={`text-xs px-2 py-1 rounded font-medium ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}

export default function ValidatePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = async () => {
        if (!url) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/api/seo/validate', { url });

            if (response.data.success) {
                setResult(response.data.data);
            } else {
                setError(response.data.error || 'Validation failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to validate URL');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <>
            <Head>
                <title>URL Validator | SEO Inspector</title>
            </Head>

            <main className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/seo"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    URL Validator
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Check meta tags and SEO elements for any URL
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* URL Input */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter URL to validate
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://theboringeducation.com/"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleValidate();
                                }}
                            />
                            <button
                                onClick={handleValidate}
                                disabled={loading || !url}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Validating...' : 'Validate'}
                            </button>
                        </div>

                        {/* Quick URLs */}
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">
                                Quick test:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'https://theboringeducation.com/',
                                    'https://prepyatra.theboringeducation.com/',
                                    'https://quiz.theboringeducation.com/'
                                ].map((testUrl) => (
                                    <button
                                        key={testUrl}
                                        onClick={() => setUrl(testUrl)}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        {testUrl.replace(
                                            'https://',
                                            ''
                                        ).replace(/\/$/, '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
                            {error}
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Validation Score
                                        </h2>
                                        <p className="text-sm text-gray-500 truncate max-w-md">
                                            {result.url}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`text-4xl font-bold ${getScoreColor(result.score)}`}
                                        >
                                            {result.score}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            / 100
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            result.isSSR
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {result.isSSR
                                            ? 'SSR/SSG Detected'
                                            : 'Client-Side Rendering'}
                                    </span>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Primary Meta
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Title ({result.title.length} chars)
                                        </label>
                                        <p className="font-medium text-gray-900 mt-1">
                                            {result.title || (
                                                <span className="text-red-500">
                                                    Missing
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Description (
                                            {result.description.length} chars)
                                        </label>
                                        <p className="text-gray-700 mt-1">
                                            {result.description || (
                                                <span className="text-red-500">
                                                    Missing
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Tags */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Meta Tags
                                    </h3>
                                </div>
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Tag
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                Content
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {result.metaTags.map((tag, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 font-mono text-sm">
                                                    {tag.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={tag.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                                                    {tag.content || (
                                                        <span className="text-gray-400 italic">
                                                            {tag.recommendation}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Issues */}
                            {result.issues.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Issues Found ({result.issues.length})
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.issues.map((issue, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <svg
                                                    className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                    />
                                                </svg>
                                                <span className="text-gray-700">
                                                    {issue}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

