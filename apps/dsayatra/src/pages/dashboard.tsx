import { SEO } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { cn, getPreFetchProps } from '@tbe/utils';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@ui/card";

import Link from "next/link";
import { Fragment } from 'react';

import { useAuth } from "@tbe/auth";
import {
    Target,
    Calendar,
    TrendingUp,
    BookOpen,
    Settings,
    Code2,
    CheckCircle2
} from "lucide-react";
import { Button } from "@ui/button";
import { Progress } from "@ui/progress";

function DsaClient() {
    "use client";
    const { user } = useAuth();

    // In a real app, this data would come from the API/session based on onboarding
    // For now, we assume this is the 'very basic dashboard' requested.
    // If user.dsaYatra payload exists on session, it could be read from there.
    const targetLabel = (user as any)?.dsaYatra?.target || "Product-based";
    const timelineLabel = (user as any)?.dsaYatra?.timeline || "4-6 months";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Welcome back, {user?.name || "Yatree"}!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Here's your current DSA preparation progress.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Goal & Timeline Info */}
                    <Card className="col-span-1 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Your Goals
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-500" asChild>
                                    <Link href="/edit-goals">
                                        <Settings className="w-4 h-4" />
                                        Edit Goals
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{targetLabel}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Timeline</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{timelineLabel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overall Progress Stats */}
                    <Card className="col-span-1 md:col-span-2 border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Stats & Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="my-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">Roadmap Progress</span>
                                    <span className="font-bold text-primary">12%</span>
                                </div>
                                <Progress value={12} className="h-2 bg-gray-100 dark:bg-zinc-800" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Code2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">45</p>
                                        <p className="text-xs text-gray-500">Problems Solved</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                                    <div className="p-2 bg-green-500/10 rounded-md">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">8</p>
                                        <p className="text-xs text-gray-500">Topics Covered</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Continue Learning CTA */}
                <div className="mt-8 text-center bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-8">
                    <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Ready to master the next topic?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
                        Jump right back into your personalized {targetLabel} prep sheet based on your {timelineLabel} timeline.
                    </p>
                    <Button size="lg" className="px-8 font-semibold shadow-lg" asChild>
                        <Link href="/sheet">
                            Continue Learning
                        </Link>
                    </Button>
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
