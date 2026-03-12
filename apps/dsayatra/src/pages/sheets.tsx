import { DsaQuestionList, LoadingSpinner, QuestionDetailPanel, FlexContainer, Text, LinkButton, Button, EditDsaOnboardingModal, SEO, LearningNavbar, Footer } from "@tbe/components"
import { routes, TOPIC_LABELS } from "@tbe/constants"
import { useApi, useUser } from "@tbe/hooks"
import type { DsaQuestion, UserProfile, PageProps } from "@tbe/interface"
import { userService } from "@tbe/services";
import { getPreFetchProps, cn } from "@tbe/utils";
import { useRouter } from "next/router"
import React, { useEffect, useState, useMemo, Fragment } from "react"
import { Target } from "lucide-react";

import { transformDsaQuestion } from "../utils/dsaHelpers"

const SheetsPageClient = () => {
    const router = useRouter()
    const { loading: userLoading, isAuth, user } = useUser()
    const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(null)
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Completed questions tracking (localStorage for now)
    const [completedQuestions, setCompletedQuestions] = useState<(string | number)[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('dsayatra_completed_questions');
        if (saved) {
            try { setCompletedQuestions(JSON.parse(saved)); } catch { }
        }
    }, []);

    const toggleQuestionComplete = (questionId: string | number) => {
        setCompletedQuestions(prev => {
            const isCompletedNow = !prev.includes(questionId);
            const next = isCompletedNow
                ? [...prev, questionId]
                : prev.filter(id => id !== questionId);
            localStorage.setItem('dsayatra_completed_questions', JSON.stringify(next));

            // Maintain a count of questions solved today
            const todayStr = new Date().toDateString();
            const todayStatsStr = localStorage.getItem('dsayatra_today_stats');
            let todayStats = todayStatsStr ? JSON.parse(todayStatsStr) : { date: todayStr, solvedCount: 0 };

            if (todayStats.date !== todayStr) {
                todayStats = { date: todayStr, solvedCount: 0 }; // Reset for a new day
            }

            if (isCompletedNow) {
                todayStats.solvedCount += 1;
            } else if (todayStats.solvedCount > 0) {
                todayStats.solvedCount -= 1;
            }

            localStorage.setItem('dsayatra_today_stats', JSON.stringify(todayStats));

            return next;
        });
    };

    useEffect(() => {
        if (user?.id) {
            setIsProfileLoading(true);
            userService.getProfile(user.id).then(p => {
                setProfile(p);
                setIsProfileLoading(false);
            }).catch(() => setIsProfileLoading(false));
        } else if (!userLoading) {
            setIsProfileLoading(false);
        }
    }, [user?.id, userLoading]);

    const { response, loading: sheetsLoading } = useApi("dashboard-dsa-sheet", {
        url: `${routes.api.base}${routes.api.dsaSheet}?limit=1000`,
    })

    const dsaQuestions = React.useMemo(() => {
        const data = response?.data?.questions

        if (!Array.isArray(data)) return []

        return data.map(transformDsaQuestion)
    }, [response])

    const topicsWithCounts = useMemo(() => {
        const topicMap = new Map<string, number>()

        dsaQuestions.forEach((question) => {
            const primaryTopic = question.topics?.[0]
            if (primaryTopic) {
                topicMap.set(primaryTopic, (topicMap.get(primaryTopic) || 0) + 1)
            }
        })

        return Array.from(topicMap.entries())
            .map(([topic, count]) => ({
                topic,
                count,
                label: TOPIC_LABELS[topic] || topic
            }))
            .sort((a, b) => {
                const priorityA = Object.keys(TOPIC_LABELS).indexOf(a.topic)
                const priorityB = Object.keys(TOPIC_LABELS).indexOf(b.topic)
                if (priorityA !== -1 && priorityB !== -1) {
                    return priorityA - priorityB
                }
                return a.label.localeCompare(b.label)
            })
    }, [dsaQuestions])

    const topicsCompletionMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        topicsWithCounts.forEach(({ topic }) => {
            const topicQuestions = dsaQuestions.filter(q => q.topics?.[0] === topic);
            const isCompleted = topicQuestions.length > 0 && topicQuestions.every(q => {
                const qId = q.id || q.name;
                return completedQuestions.includes(qId);
            });
            map[topic] = isCompleted;
        });
        return map;
    }, [topicsWithCounts, dsaQuestions, completedQuestions]);

    const filteredQuestions = useMemo(() => {
        if (!selectedTopic) return []
        return dsaQuestions.filter(q => q.topics?.[0] === selectedTopic)
    }, [dsaQuestions, selectedTopic])

    useEffect(() => {
        if (!userLoading && !isAuth) {
            router.push("/login")
        }
    }, [userLoading, isAuth, router])

    const handleQuestionClick = (question: DsaQuestion) => {
        setSelectedQuestion(question)
    }

    const handleTopicClick = (topic: string) => {
        setSelectedTopic(topic)
        setSelectedQuestion(null)
    }

    const handleBackToTopics = () => {
        setSelectedTopic(null)
        setSelectedQuestion(null)
    }

    if (sheetsLoading || userLoading || isProfileLoading) {
        return (
            <div className="flex bg-[#0f0f0f] font-sans h-screen items-center justify-center">
                <LoadingSpinner height={8} width={8} />
                <Text level="p" className="text-gray-400 ml-3">Loading Sheet...</Text>
            </div>
        )
    }

    const targetLabel = profile?.dsaYatra?.target || "Product-based";
    const timelineLabel = profile?.dsaYatra?.timeline || "4-6 months";
    const expLabel = profile?.dsaYatra?.experienceLevel || "Fresher (0-1 yr)";

    const isMatch = targetLabel === "Product-based" && timelineLabel === "4-6 months" && expLabel === "Fresher (0-1 yr)";

    if (!isMatch) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
                <LearningNavbar backHref={routes.dsayatra.dashboard} />
                <main className="flex-1 pt-[72px] flex flex-col items-center justify-center px-4">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 max-w-lg text-center">
                        <Target className="w-16 h-16 text-[#ff5757] mx-auto mb-4" />
                        <Text level="h3" className="text-xl font-bold text-white mb-2">Sheet Currently Unavailable</Text>
                        <Text level="p" className="text-gray-400 mb-6">
                            This specific sheet is curated for users targeting <strong>Product-based companies</strong> within <strong>4-6 months</strong> with <strong>Fresher (0-1 yr)</strong> experience. <br /><br />
                            Update your goals to access the SA PREP sheet, or explore topics directly.
                        </Text>
                        <Button
                            variant="PRIMARY"
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-[#ff5757] hover:bg-[#ff4444] text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105"
                        >
                            Adjust My Goals
                        </Button>
                    </div>
                </main>
                <Footer isMini={true} />
                <EditDsaOnboardingModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={() => {
                        if (user?.id) {
                            setIsProfileLoading(true);
                            userService.getProfile(user.id).then(p => {
                                setProfile(p);
                                setIsProfileLoading(false);
                            });
                        }
                    }}
                    currentData={profile as any}
                    userId={user?.id || ""}
                />
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#ff5757]/30 overflow-hidden">
            <LearningNavbar backHref={routes.dsayatra.dashboard} />

            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden w-full">
                    {/* Left Sidebar - Topics or Questions */}
                    <div className={cn(
                        "flex flex-col flex-shrink-0 border-r border-[#2a2a2a] bg-black transition-all duration-300 min-h-0",
                        selectedTopic ? "w-full lg:w-[350px]" : "flex-1 lg:flex-none w-full lg:w-[340px]"
                    )}>
                        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin-grey">
                            {!selectedTopic ? (
                                <div className="flex flex-col">
                                    <LinkButton
                                        href={routes.dsayatra.dashboard}
                                        className="mb-2 inline-block self-start"
                                        buttonProps={{
                                            variant: "OUTLINE",
                                            size: "SMALL",
                                            text: "← Back",
                                            className: "border-[#ff5757]/40 text-[#ff5757] bg-transparent hover:border-[#ff5757] hover:bg-[#ff5757]/10 font-bold px-4"
                                        }}
                                    />
                                    <div className="mb-2">
                                        <h1 className="text-[24px] font-bold text-white glow-text tracking-tight uppercase">EXPLORE TOPICS</h1>
                                        <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Choose a Topic to Begin</p>
                                    </div>

                                    <FlexContainer direction="col" fullWidth itemCenter={false} justifyCenter={false} wrap={false} className="gap-2">
                                        {topicsWithCounts.map(({ topic, count, label }, index) => {
                                            const isCompleted = topicsCompletionMap[topic];
                                            return (
                                                <div
                                                    key={topic}
                                                    className={cn("w-full border rounded-xl px-4 py-3.5 transition-all duration-200 cursor-pointer group flex items-center justify-between",
                                                        isCompleted ? "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 bg-[#0A0A0A]" : "border-[#1A1C20] hover:border-[#ff5757] hover:bg-transparent bg-[#050505]"
                                                    )}
                                                    onClick={() => handleTopicClick(topic)}
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={cn("flex items-center justify-center w-[22px] h-[22px] rounded-full border text-[11px] font-bold transition-all duration-200 shrink-0",
                                                            isCompleted ? "border-green-500 text-green-500" : "border-[#2a2a2a] text-[#555] group-hover:border-[#ff5757] group-hover:text-[#ff5757]")}>
                                                            {index + 1}
                                                        </div>
                                                        <Text level="p" className={cn("text-[15px] font-bold truncate transition-colors", isCompleted ? "text-green-500" : "text-white glow-text")}>
                                                            {label}
                                                        </Text>
                                                    </div>
                                                    <div className="ml-3 shrink-0">
                                                        <Text level="span" className={cn("text-[13px] font-medium", isCompleted ? "text-green-500/80" : "text-[#555]")}>
                                                            {count}
                                                        </Text>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </FlexContainer>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-xl font-bold text-white glow-text tracking-tight uppercase">Questions in {TOPIC_LABELS[selectedTopic] || selectedTopic}</h1>
                                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest opacity-60 font-bold">Select a question to view details</p>
                                    </div>

                                    <Button
                                        variant="GHOST"
                                        onClick={handleBackToTopics}
                                        className="bg-black border border-[#ff5757]/40 text-[#ff5757] hover:text-[#ff5757] hover:border-[#ff5757] px-5 py-2 rounded-xl flex items-center gap-2 transition-all glow-button self-start text-xs font-bold"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                                        <span className="glow-text">All Topics</span>
                                    </Button>

                                    <DsaQuestionList
                                        questions={filteredQuestions}
                                        selectedQuestionId={selectedQuestion?.id}
                                        onQuestionClick={handleQuestionClick}
                                        completedQuestionIds={completedQuestions}
                                        onToggleComplete={toggleQuestionComplete}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={cn(
                        "flex-1 flex flex-col min-w-0 bg-[#0A0A0A] overflow-hidden",
                        !selectedTopic ? "hidden lg:flex" : "flex"
                    )}>
                        <div className="flex-1 overflow-y-auto scrollbar-thin-grey px-4 py-8 scroll-smooth" id="right-scroll-area">
                            {!selectedTopic ? (
                                <FlexContainer className="h-full" itemCenter justifyCenter fullWidth wrap={false}>
                                    <div className="text-center space-y-3 bg-[#111] p-10 rounded-2xl border border-[#2a2a2a] max-w-lg">
                                        <Target className="w-12 h-12 text-[#ff5757]/50 mx-auto" />
                                        <Text level="p" className="text-gray-300 text-[16px] font-bold">Select a topic from the left</Text>
                                        <Text level="p" className="text-gray-500 text-[12px]">Start your focused FAANG preparation today. Click on any topic to view the curated list of questions.</Text>
                                    </div>
                                </FlexContainer>
                            ) : (
                                <div className="w-full max-w-4xl px-4">
                                    <div className="mb-6 pb-4 border-b border-[#2a2a2a]">
                                        <Text level="h2" className="text-2xl font-bold text-white mb-1">
                                            {TOPIC_LABELS[selectedTopic] || selectedTopic}
                                        </Text>
                                        <Text level="p" className="text-sm text-gray-400">
                                            Continue your {TOPIC_LABELS[selectedTopic] || selectedTopic} preparation journey.
                                        </Text>
                                    </div>

                                    <div className="pb-1 w-full">
                                        <QuestionDetailPanel question={selectedQuestion} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .scrollbar-thin-grey::-webkit-scrollbar {
                        width: 4px;
                        height: 4px;
                    }
                    .scrollbar-thin-grey::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .scrollbar-thin-grey::-webkit-scrollbar-thumb {
                        background: #333;
                        border-radius: 10px;
                    }
                    .scrollbar-thin-grey::-webkit-scrollbar-thumb:hover {
                        background: #444;
                    }
                    .glow-text {
                        text-shadow: 0 0 10px rgba(255, 87, 87, 0.4), 0 0 20px rgba(255, 87, 87, 0.2);
                    }
                    .glow-button {
                        box-shadow: 0 0 15px rgba(255, 87, 87, 0.1);
                        border-color: rgba(255, 87, 87, 0.3) !important;
                    }
                    .glow-button:hover {
                        box-shadow: 0 0 20px rgba(255, 87, 87, 0.2);
                        border-color: rgba(255, 87, 87, 0.5) !important;
                    }
                ` }} />
            </main>
        </div>
    )
}

export default function SheetsPage({ seoMeta }: PageProps) {
    return (
        <Fragment>
            <SEO seoMeta={seoMeta} appId="dsayatra" />
            <SheetsPageClient />
        </Fragment>
    )
}

export const getServerSideProps = async () => getPreFetchProps({ slug: "/sheets", appId: "dsayatra" });
