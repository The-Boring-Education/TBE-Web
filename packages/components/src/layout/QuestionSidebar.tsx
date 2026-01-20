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
}

export default function QuestionSidebar({
    questions,
    selected,
    onSelect,
}: Props) {
    return (
        <div className="w-[320px] border-r border-zinc-800 p-3 space-y-3 overflow-y-auto">
            {questions.map((q) => (
                <div
                    key={q.id}
                    onClick={() => onSelect(q)}
                    className={`cursor-pointer rounded-xl p-4 border transition
            ${selected.id === q.id
                            ? "bg-zinc-900 border-zinc-700"
                            : "bg-zinc-950 border-zinc-900 hover:border-zinc-700"
                        }`}
                >
                    <h3 className="text-sm font-medium mb-2">{q.title}</h3>

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
                                className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400"
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
