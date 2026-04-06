import type { DSAQuestion, DSAQuestionDetailsProps } from "@tbe/types";
import { ArrowLeft } from "lucide-react";

export type { DSAQuestion };

export default function QuestionDetails({
  question,
  className = "",
  onBack,
}: DSAQuestionDetailsProps) {
  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 md:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </button>
      )}
      <h1 className="text-xl md:text-2xl font-bold mb-3">{question.title}</h1>

      <div className="flex gap-2 mb-6">
        <span
          className={`px-3 py-1 text-xs rounded-full
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
            className="bg-zinc-800 text-zinc-400 px-3 py-1 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
        {(question.isRealWorld || question.isRealWorldProblem) && (
          <span className="bg-blue-950/40 text-blue-400 px-3 py-1 text-xs rounded-full border border-blue-900/50">
            Real world
          </span>
        )}
      </div>

      <p className="text-zinc-300 leading-relaxed">{question.description}</p>
    </div>
  );
}
