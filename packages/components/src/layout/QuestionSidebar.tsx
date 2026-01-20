import React, { useState } from "react";
import { Filter } from "lucide-react";

export interface Question {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    description: string;
}

interface Props {
    questions: Question[];
    selected: Question;
    onSelect: (question: Question) => void;
    onFilter?: (filters: any) => void;
}

export default function QuestionSidebar({
    questions,
    selected,
    onSelect,
    onFilter = () => { },
}: Props) {
    const [filters, setFilters] = useState({
        domain: "",
        difficulty: "",
        topic: "",
        companyType: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filteredQuestions, setFilteredQuestions] = useState(questions);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const filtered = questions.filter((q) => {
            const matchesDomain = !filters.domain || q.tags.some(tag => tag.toLowerCase() === filters.domain.toLowerCase());
            const matchesDifficulty = !filters.difficulty || q.difficulty.toLowerCase() === filters.difficulty.toLowerCase();
            const matchesTopic = !filters.topic || q.tags.some(tag => tag.toLowerCase() === filters.topic.toLowerCase());
            const matchesCompanyType = !filters.companyType || q.tags.some(tag => tag.toLowerCase() === filters.companyType.toLowerCase());

            return matchesDomain && matchesDifficulty && matchesTopic && matchesCompanyType;
        });

        setFilteredQuestions(filtered);
        onFilter(filters);
        setShowFilters(false);
    };

    return (
        <div className="w-[320px] border-r border-black p-3 space-y-3 overflow-y-auto relative">
            <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="absolute top-3 right-3 bg-[#ff5757] text-white px-4 py-2 rounded flex items-center justify-center"
            >
                <Filter className="text-white" />
            </button>

            {showFilters && (
                <div className="absolute top-12 right-3 bg-black text-white p-4 rounded shadow-lg">
                    <div className="mb-2">
                        <label className="block text-sm">Domain</label>
                        <select
                            className="w-full bg-gray-900 border-primary text-white p-2 rounded"
                            onChange={(e) => handleFilterChange("domain", e.target.value)}
                        >
                            <option value="">All Domains</option>
                            <option value="Front-End">Front-End</option>
                            <option value="Back-End">Back-End</option>
                            <option value="Full Stack">Full Stack</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm">Difficulty</label>
                        <select
                            className="w-full bg-gray-900 border-primary text-white p-2 rounded"
                            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm">Topic</label>
                        <select
                            className="w-full bg-gray-900 border-primary/80 border-primary text-white p-2 rounded"
                            onChange={(e) => handleFilterChange("topic", e.target.value)}
                        >
                            <option value="">All Topics</option>
                            <option value="String">String</option>
                            <option value="Array">Array</option>
                        </select>
                    </div>

                    <div className="mb-2">
                        <label className="block text-sm">Company Type</label>
                        <select
                            className="w-full bg-gray-900 border-primary text-white p-2 rounded"
                            onChange={(e) => handleFilterChange("companyType", e.target.value)}
                        >
                            <option value="">All Companies</option>
                            <option value="Startup">Startup</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>

                    <button
                        onClick={applyFilters}
                        className="w-full bg-gray-900 border-primary text-white p-2 rounded"
                    >
                        Apply Filters
                    </button>
                </div>
            )}

            {filteredQuestions.map((q) => (
                <div
                    key={q.id}
                    onClick={() => onSelect(q)}
                    className={`cursor-pointer rounded-xl p-4 border transition
            ${selected.id === q.id
                            ? "bg-black border-[#ff5757]"
                            : "bg-black border-black hover:border-[#ff5757]"
                        }`}
                >
                    <h3 className="text-sm font-medium mb-2 text-white">{q.title}</h3>

                    <div className="flex flex-wrap gap-2">
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full
              ${q.difficulty === "Easy"
                                    ? "bg-green-900 text-green-400"
                                    : q.difficulty === "Medium"
                                        ? "bg-yellow-900 text-yellow-400"
                                        : "bg-red-900 text-red-400"
                                }`}
                        >
                            {q.difficulty}
                        </span>

                        {q.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-xs bg-[#ff5757] px-2 py-0.5 rounded-full text-white"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
