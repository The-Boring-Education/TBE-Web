import { FaRegStar, FaStar } from "react-icons/fa";

import { CoreSubjectMDXRenderer } from "./CoreSubjectMDXRenderer";

interface InterviewQuestionContentProps {
  questionTitle: string;
  question: string;
  answer: string;
  frequency?: string;
  priority?: string;
  companyTypes?: string[];
  actions?: React.ReactNode[];
  isStarred?: boolean;
  onToggleStar?: () => void;
}

const InterviewQuestionContent = ({
  questionTitle,
  question,
  answer,
  frequency,
  priority,
  companyTypes,
  actions,
  isStarred,
  onToggleStar,
}: InterviewQuestionContentProps) => {
  return (
    <div className="w-full flex flex-col">
      {/* Sleek Minimal Title */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          {questionTitle}
        </h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.();
          }}
          className="p-1.5 rounded-full transition-all duration-200 hover:bg-white/5 active:scale-95 shrink-0 cursor-pointer text-xl"
          aria-label={isStarred ? "Unstar question" : "Star question"}
        >
          {isStarred ? (
            <FaStar className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          ) : (
            <FaRegStar className="text-white/30 hover:text-white/60" />
          )}
        </button>
      </div>

      {/* Sleek aesthetic breadcrumb & priority / frequency / companies row */}
      <div className="flex items-center gap-3 text-xs text-gray-550 pb-4 border-b border-gray-900 mb-6 flex-wrap">
        {priority && (
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
            {priority} Priority
          </span>
        )}
        {frequency && (
          <>
            {priority && <span className="text-gray-700 font-semibold">•</span>}
            <span className="font-semibold text-gray-400">{frequency}</span>
          </>
        )}
        {companyTypes && companyTypes.length > 0 && (
          <>
            {(priority || frequency) && (
              <span className="text-gray-700 font-semibold">•</span>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              {companyTypes.map((ct) => (
                <span key={ct} className="text-gray-400 font-semibold">
                  {ct}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Structured Content matching Core Subjects */}
      <div className="space-y-8 w-full">
        {question && (
          <div className="space-y-4 pb-8 border-b border-gray-900">
            <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[2px] bg-red-500 rounded-full" />
              Problem Statement
            </h2>
            <div className="prose prose-invert max-w-none prose-red prose-headings:scroll-mt-6">
              <CoreSubjectMDXRenderer mdxSource={question} />
            </div>
          </div>
        )}

        {answer && (
          <div className="space-y-4">
            <div className="prose prose-invert max-w-none prose-red prose-headings:scroll-mt-6">
              <CoreSubjectMDXRenderer mdxSource={answer} />
            </div>
          </div>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-900 flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionContent;
