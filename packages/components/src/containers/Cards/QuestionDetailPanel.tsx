import { FlexContainer } from "@tbe/components";
import type { DsaSectionTabs } from "@tbe/interface";
import type { QuestionDetailProps } from "@tbe/interface";
import { useState } from "react";

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
        <div className="text-white w-full space-y-6 flex flex-col h-full relative">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">{question.name}</h1>

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

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === "description" && (
                    <div className="space-y-6">
                        {/* Description */}
                        <div className="space-y-3 pb-6 border-b border-gray-700">
                            <h2 className="text-red-500 font-bold text-sm tracking-wide uppercase">DESCRIPTION</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                                {question.description || question.content}
                            </p>
                        </div>

                        {question.examples && question.examples.length > 0 && (
                            <div className="space-y-4 pb-6 border-b border-gray-700">
                                {question.examples.map((example, index) => (
                                    <div key={index} className="space-y-2">
                                        <h3 className="text-white font-medium text-sm">Example {index + 1}:</h3>
                                        <div className="bg-[#111] border border-gray-800 rounded-lg p-3 space-y-3">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    <span className="text-gray-500 text-xs min-w-[50px] pt-1">Input:</span>
                                                    <div className="bg-[#1a1a1a] px-3 py-1.5 rounded text-gray-200 text-xs font-mono flex-1 border border-gray-800">
                                                        {example.input}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-gray-500 text-xs min-w-[50px] pt-1">Output:</span>
                                                    <div className="bg-[#1a1a1a] px-3 py-1.5 rounded text-gray-200 text-xs font-mono flex-1 border border-gray-800">
                                                        {example.output}
                                                    </div>
                                                </div>
                                            </div>
                                            {example.explanation && (
                                                <div className="text-gray-400 text-xs border-t border-gray-800 pt-2 mt-1">
                                                    <span className="text-gray-500 mr-2">Explanation:</span>
                                                    {example.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {question.constraints && question.constraints.length > 0 && (
                            <div className="space-y-2 pb-6 border-b border-gray-800">
                                <h3 className="text-white font-medium text-sm">Constraints:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs">
                                    {question.constraints.map((constraint, index) => (
                                        <li key={index} className="ml-2 pl-1 marker:text-gray-600">{constraint}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <h2 className="text-red-500 font-bold text-sm">Resources</h2>
                            <div className="bg-[#111] border border-gray-800 rounded-lg p-3 flex gap-4 items-center justify-center">
                                {question.leetcodeLink && (
                                    <a
                                        href={question.leetcodeLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                                        title="LeetCode Problem"
                                    >
                                        <svg className="w-6 h-6 text-[#FFA116]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                                        </svg>
                                    </a>
                                )}

                                {question.youtubeSearchLink && (
                                    <a
                                        href={question.youtubeSearchLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                                        title="YouTube Explanation"
                                    >
                                        <svg className="w-8 h-8 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "topics" && (
                    <div>
                        <h2 className="text-red-500 font-semibold mb-3">TOPICS</h2>
                        <div className="flex flex-wrap gap-2">
                            {question.topics?.map((topic) => (
                                <span key={topic} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                                    {topic}
                                </span>
                            )) || <p className="text-gray-500 text-sm">No topics available.</p>}
                        </div>
                    </div>
                )}

                {activeTab === "companies" && (
                    <div>
                        <h2 className="text-red-500 font-semibold mb-3">COMPANIES</h2>
                        <FlexContainer className="flex flex-wrap gap-2">
                            {question.companyType?.map((company) => (
                                <span key={company} className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                                    {company}
                                </span>
                            )) || <p className="text-gray-500 text-sm">No companies available.</p>}
                        </FlexContainer>
                    </div>
                )}

                {activeTab === "code" && (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-gray-800 rounded-lg bg-[#111]">
                        <p className="mb-2">Code editor integration coming soon.</p>
                        {question.leetcodeLink && (
                            <a
                                href={question.leetcodeLink}
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
        </div>
    );
};

export default QuestionDetailPanel;