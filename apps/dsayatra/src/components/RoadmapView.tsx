import { cn } from "@tbe/utils";
import { Badge } from "@ui/badge";
import { Card, CardContent } from "@ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { Topic } from "@/data/dsaData";

interface RoadmapViewProps {
    title: string;
    description: string;
    data: Topic[];
    backLink?: string;
    backLinkText?: string;
    disclaimer?: React.ReactNode;
}

export const RoadmapView = ({
    title,
    description,
    data,
    backLink = "/dashboard",
    backLinkText = "Back to Dashboard",
    disclaimer
}: RoadmapViewProps) => {

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200';
            case 'Hard': return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200';
            default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href={backLink}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {backLinkText}
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                        {description}
                    </p>
                </div>

                {disclaimer && (
                    <div className="mb-10">
                        {disclaimer}
                    </div>
                )}

                {/* Topics Grid */}
                <div className="space-y-12">
                    {data.map((topic: Topic) => (
                        <div key={topic.topic} className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-2">
                                <span className="text-2xl" role="img" aria-label={topic.topic}>{topic.emoji}</span>
                                <h2 className="text-2xl font-semibold text-gray-900">{topic.topic}</h2>
                            </div>

                            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                {topic.questions.map((question, qIndex) => (
                                    <Card
                                        key={qIndex}
                                        className="group hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-white border-gray-200"
                                    >
                                        <Link
                                            href={question.leetcode_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block h-full"
                                        >
                                            <CardContent className="p-5 flex items-start justify-between gap-4 h-full">
                                                <div className="space-y-2">
                                                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors leading-snug">
                                                        {question.title}
                                                    </h3>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <Badge variant="outline" className={cn("whitespace-nowrap", getDifficultyColor(question.difficulty))}>
                                                        {question.difficulty}
                                                    </Badge>
                                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
