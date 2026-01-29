import { FlexContainer } from "@tbe/components";
import type { DsaSectionTabs } from "@tbe/interface"
import type { QuestionDetailProps } from "@tbe/interface"
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
        <div className="text-white w-full space-y-6">
            <h1 className="text-2xl font-semibold">{question.name}</h1>

            <div className="flex gap-3 mt-4">
                {["description", "topics", "companies",].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as DsaSectionTabs)}
                        className={`px-2 py-1.5 text-sm rounded-full border transition ${activeTab === tab
                            ? "border-red-500 text-red-400 bg-red-950/30"
                            : "border-gray-600 text-gray-300 hover:border-gray-400"
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === "description" && (
                <div className="space-y-4">
                    <h2 className="text-red-500 font-semibold">DESCRIPTION</h2>

                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {question.content}
                    </p>
                </div>
            )}

            {activeTab === "topics" && (
                <div>
                    <h2 className="text-red-500 font-semibold mb-3">TOPICS</h2>
                    <div className="flex flex-wrap gap-2">
                        {question.topics?.map((topic) => (
                            <span
                                key={topic}
                                className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                            >
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
                            <span
                                key={company}
                                className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                            >
                                {company}
                            </span>
                        )) || <p className="text-gray-500 text-sm">No companies available.</p>}
                    </FlexContainer>
                </div>
            )
            }
        </div >
    );
};

export default QuestionDetailPanel;