import type { DSAQuestion, DSAQuestionSidebarProps } from "@tbe/types";

export type { DSAQuestion };

export default function QuestionSidebar({
  questions,
  selected,
  onSelect,
  className = "",
}: DSAQuestionSidebarProps) {
  return (
    <div
      className={`w-full md:w-[320px] border-r border-zinc-800 p-3 space-y-3 overflow-y-auto ${className}`}
    >
      {questions.map((question) => (
        <div
          key={question.id}
          onClick={() => onSelect(question)}
          className={`cursor-pointer rounded-xl p-4 border transition
            ${
              selected.id === question.id
                ? "bg-zinc-900 border-zinc-700"
                : "bg-zinc-950 border-zinc-900 hover:border-zinc-700"
            }`}
        >
          <h3 className="text-sm font-medium mb-2">{question.title}</h3>

          <div className="flex flex-wrap gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full
              ${
                question.difficulty === "Easy"
                  ? "bg-green-900 text-green-400"
                  : question.difficulty === "Medium"
                    ? "bg-yellow-900 text-yellow-400"
                    : "bg-red-900 text-red-400"
              }`}
            >
              {question.difficulty}
            </span>

            {question.tags.map((tag, index) => (
              <span
                key={index}
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
