import { SEO } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { cn, getPreFetchProps } from '@tbe/utils';
import { Card, CardDescription, CardHeader, CardTitle } from "@ui/card";

import Link from "next/link";
import { Fragment } from 'react';

function DsaClient() {
    "use client";

    const targetOptions = [
        { id: 'startup', name: 'Startup', emoji: '🚀', description: 'Core fundamentals for early-stage companies' },
        { id: 'mnc', name: 'Mid-size MNC', emoji: '🏢', description: 'Comprehensive prep for established companies' },
        { id: 'faang', name: 'FAANG', emoji: '🌟', description: 'Advanced concepts for top-tier tech giants' }
    ];

    const domainOptions = [
        { id: 'fullstack', name: 'Full-stack', emoji: '💻', description: 'End-to-end development focus' },
        { id: 'datascience', name: 'Data Science', emoji: '📊', description: 'Analytics and ML-oriented problems' },
        { id: 'appdev', name: 'App Dev', emoji: '📱', description: 'Mobile and app development patterns' },
        { id: 'ml', name: 'Machine Learning', emoji: '🤖', description: 'AI and optimization challenges' },
        { id: 'analyst', name: 'Data Analyst', emoji: '📈', description: 'SQL and data manipulation focus' },
        { id: 'ai', name: 'AI', emoji: '🧠', description: 'Artificial intelligence algorithms' }
    ];

    const timeOptions = [
        { id: '2months', name: '2 Months ONLY', emoji: '⚡', description: 'Intensive crash course' },
        { id: '3-4months', name: '3-4 Months', emoji: '🎯', description: 'Balanced comprehensive learning' },
        { id: '5+months', name: '5+ Months', emoji: '🏔️', description: 'Complete mastery journey' }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 py-12">
                <div className="space-y-16">
                    {/* Target-based Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Target</h2>
                            <p className="text-gray-500">Select based on your dream company</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {targetOptions.map((option) => (
                                <Link key={option.id} href={`/target/${option.id}`} className="block h-full group">
                                    <Card className={cn(
                                        "h-full transition-all duration-200 hover:shadow-md border-gray-200",
                                        "hover:border-primary/50"
                                    )}>
                                        <CardHeader className="text-center">
                                            <div className="text-4xl mb-4 transform transition-transform duration-200 group-hover:scale-110">
                                                {option.emoji}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{option.name}</CardTitle>
                                            <CardDescription className="text-gray-500 text-sm">{option.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Domain-based Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Domain</h2>
                            <p className="text-gray-500">Pick your specialization area</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {domainOptions.map((option) => (
                                <Link key={option.id} href={`/domain/${option.id}`} className="block h-full group">
                                    <Card className={cn(
                                        "h-full transition-all duration-200 hover:shadow-md border-gray-200",
                                        "hover:border-primary/50"
                                    )}>
                                        <CardHeader className="text-center">
                                            <div className="text-4xl mb-4 transform transition-transform duration-200 group-hover:scale-110">
                                                {option.emoji}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{option.name}</CardTitle>
                                            <CardDescription className="text-gray-500 text-sm">{option.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Time-based Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Timeline</h2>
                            <p className="text-gray-500">How much time do you have?</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {timeOptions.map((option) => (
                                <Link key={option.id} href={`/time/${option.id}`} className="block h-full group">
                                    <Card className={cn(
                                        "h-full transition-all duration-200 hover:shadow-md border-gray-200",
                                        "hover:border-primary/50"
                                    )}>
                                        <CardHeader className="text-center">
                                            <div className="text-4xl mb-4 transform transition-transform duration-200 group-hover:scale-110">
                                                {option.emoji}
                                            </div>
                                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{option.name}</CardTitle>
                                            <CardDescription className="text-gray-500 text-sm">{option.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Dashboard = ({ seoMeta }: PageProps) => {
    return (
        <Fragment>
            <SEO seoMeta={seoMeta} />
            <DsaClient />
        </Fragment>
    );
}

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.dsayatra.home, appId: "dsayatra" })),
    revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Dashboard;
