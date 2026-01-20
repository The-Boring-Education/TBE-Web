export interface Question {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    description: string;
}

interface Props {
    question: Question;
}

export default function QuestionDetails({ question }: Props) {
    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-3">{question.title}</h1>

            <div className="flex gap-2 mb-6">
                <span
                    className={`px-3 py-1 text-xs rounded-full
          ${question.difficulty === "Easy"
                            ? "bg-green-900 text-green-400"
                            : question.difficulty === "Medium"
                                ? "bg-yellow-900 text-yellow-400"
                                : "bg-red-900 text-red-400"
                        }`}
                >
                    {question.difficulty}
                </span>

                {question.tags.map((tag, i) => (
                    <span
                        key={i}
                        className="bg-zinc-800 text-zinc-400 px-3 py-1 text-xs rounded-full"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <p className="text-zinc-300 leading-relaxed">
                {question.description}
            </p>
        </div>
    );
}
