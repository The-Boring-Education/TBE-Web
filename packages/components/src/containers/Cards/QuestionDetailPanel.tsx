import { FlexContainer, Text, LeetCodeIcon, YouTubeIcon } from "@tbe/components";
import type { DsaSectionTabs } from "@tbe/interface";
import type { QuestionDetailProps } from "@tbe/interface";
import { useState } from "react";
import markdownit from 'markdown-it';

const md = markdownit();

const QuestionDetailPanel = ({ question }: QuestionDetailProps) => {
    const [activeTab, setActiveTab] = useState<DsaSectionTabs>("description");

    if (!question) {
        return (
            <div className="text-gray-500 text-sm">
                Select a question from the left to view details.
            </div>
        );
    }

    return (
        <FlexContainer direction="col" className="text-white space-y-6 h-full relative" fullWidth itemCenter={false} justifyCenter={false} wrap={false}>
            <div className="space-y-4">
                <Text level="h1" className="text-2xl font-bold tracking-tight">{question.name}</Text>

                <div className="flex gap-3">
                    {["description", "topics", "companies", "code"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as DsaSectionTabs)}
                            className={`px-4 py-1.5 text-sm rounded-full border transition font-medium ${activeTab === tab
                                ? "border-red-500 text-red-400 bg-red-950/30"
                                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {activeTab === "description" && (
                    <div className="space-y-6">
                        {/* Answer / Description (Markdown) */}
                        <div className="space-y-3 pb-6 border-b border-gray-700">
                            <div
                                className="text-gray-300 leading-relaxed text-sm prose prose-invert prose-p:my-2 prose-headings:text-white prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
                                dangerouslySetInnerHTML={{ __html: md.render(question.answer || '') }}
                            />
                        </div>

                        {/* Resources */}
                        <div className="space-y-3 pt-2">
                            <Text level="h2" className="text-red-500 font-bold text-sm">Resources</Text>
                            <div className="bg-[#111] border border-gray-800 rounded-lg p-3 flex gap-4 items-center justify-center">
                                {question.resources?.leetcodeURL && (
                                    <a
                                        href={question.resources.leetcodeURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                                        title="LeetCode Problem"
                                    >
                                        <LeetCodeIcon />
                                    </a>
                                )}

                                {question.resources?.youtubeURL && (
                                    <a
                                        href={question.resources.youtubeURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                                        title="YouTube Explanation"
                                    >
                                        <YouTubeIcon />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "topics" && (
                    <div>
                        <Text level="h2" className="text-red-500 font-semibold mb-3">TOPICS</Text>
                        <div className="flex flex-wrap gap-2">
                            {question.topics?.map((topic) => (
                                <Text level="span" key={topic} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                                    {topic}
                                </Text>
                            )) || <Text level="p" className="text-gray-500 text-sm">No topics available.</Text>}
                        </div>
                    </div>
                )}

                {activeTab === "companies" && (
                    <div>
                        <Text level="h2" className="text-red-500 font-semibold mb-3">COMPANIES</Text>
                        <FlexContainer className="gap-2">
                            {question.companyType?.map((company) => (
                                <Text level="span" key={company} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                                    {company}
                                </Text>
                            )) || <Text level="p" className="text-gray-500 text-sm">No companies available.</Text>}
                        </FlexContainer>
                    </div>
                )}

                {activeTab === "code" && (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-gray-800 rounded-lg bg-[#111]">
                        <p className="mb-2">Code editor integration coming soon.</p>
                        {question.resources?.leetcodeURL && (
                            <a
                                href={question.resources.leetcodeURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 hover:text-red-300 underline text-sm"
                            >
                                Solve on LeetCode →
                            </a>
                        )}
                    </div>
                )}
            </div>
        </FlexContainer>
    );
};

export default QuestionDetailPanel;