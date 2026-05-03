import { MDXRenderer, Pill } from "@tbe/components";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaRegStar } from "react-icons/fa";

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


interface Section {
  title: string;
  content: string;
}

function parseSections(answer: string): Section[] {
  if (!answer) return [];
  const sections: Section[] = [];
  const regex = /^#{2,5}\s+(.+)$/gm;
  let match;
  const matches: { title: string; index: number }[] = [];

  while ((match = regex.exec(answer)) !== null) {
    const beforeMatch = answer.substring(0, match.index);
    const codeFences = (beforeMatch.match(/```/g) || []).length;
    if (codeFences % 2 !== 0) continue; // inside code block
    matches.push({ title: match[1].trim(), index: match.index });
  }

  if (matches.length === 0) {
    return [{ title: "Answer", content: answer.trim() }];
  }

  // If there's text before the first heading, add it as 'Introduction'
  if (matches[0].index > 0) {
    const introContent = answer.substring(0, matches[0].index).trim();
    if (introContent) {
      sections.push({ title: "Introduction", content: introContent });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const start =
      matches[i].index +
      matches[i].title.length +
      answer.substring(matches[i].index).match(/^#{2,5}\s+/)?.[0].length!;
    const end = i + 1 < matches.length ? matches[i + 1].index : answer.length;
    const content = answer.slice(start, end).trim();
    sections.push({ title: matches[i].title, content });
  }

  return sections;
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

  const sections = useMemo(() => parseSections(answer), [answer]);

  return (
    <div className="w-full flex flex-col">
      {/* Header Fields - Premium Glass Styling */}
      <div className="mb-10 p-8 md:p-12 rounded-3xl border border-white/[0.05] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {questionTitle && (
          <div className="flex items-start justify-between gap-4 mb-8">
            <h1 className="relative text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 leading-tight tracking-tight">
              {questionTitle}
            </h1>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar?.();
              }}
              className="relative z-10 mt-1 p-2 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-90 shrink-0 cursor-pointer group/star"
              aria-label={isStarred ? "Unstar question" : "Star question"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isStarred ? "starred" : "unstarred"}
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-3xl md:text-4xl"
                >
                  {isStarred ? (
                    <FaStar className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                  ) : (
                    <FaRegStar className="text-white/30 group-hover/star:text-white/60" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        )}


        <div className="relative flex flex-wrap items-center gap-2 md:gap-3">
          {frequency && (
            <div className="px-3 py-1 md:px-5 md:py-2 rounded-full bg-red-500/5 border border-red-500/40 backdrop-blur-sm transition-all duration-300">
              <span className="text-red-400 text-xs md:text-sm font-medium tracking-wide">
                {frequency}
              </span>
            </div>
          )}
          {priority && (
            <div className="px-3 py-1 md:px-5 md:py-2 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
              <span className="text-gray-300 text-xs md:text-sm font-medium tracking-wide">
                Priority: {priority}
              </span>
            </div>
          )}
          {companyTypes?.map((ct) => (
            <div 
              key={ct}
              className="px-3 py-1 md:px-5 md:py-2 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
            >
              <span className="text-gray-400 text-xs md:text-sm font-medium tracking-wide">
                {ct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Sections taking full width */}
      <div className="space-y-10 md:space-y-12 w-full mt-6 md:mt-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4 md:space-y-6 pt-6 md:pt-8 first:pt-0 border-t border-gray-800/50 first:border-0 w-full">
            <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
              <div className="w-1 md:w-1.5 h-6 md:h-7 rounded-full bg-gradient-to-b from-red-400 to-red-600 shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
              <h2 className="text-white font-extrabold text-xl md:text-2xl tracking-tight m-0 drop-shadow-md">
                {section.title}
              </h2>
            </div>
            
            <div className="text-gray-200 text-base md:text-lg leading-relaxed md:leading-loose prose prose-invert prose-lg md:prose-xl max-w-none prose-p:my-3 md:prose-p:my-4 prose-headings:mb-3 md:prose-headings:mb-4 prose-headings:mt-6 md:prose-headings:mt-8 prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-gray-800/50 prose-pre:shadow-xl prose-pre:rounded-xl prose-table:w-full prose-table:table-auto prose-table:border-collapse prose-th:bg-white/[0.05] prose-th:p-2 md:prose-th:p-4 prose-td:p-2 md:prose-td:p-4 prose-td:border-b prose-td:border-white/[0.05] prose-table:text-xs md:prose-table:text-base w-full overflow-x-auto scrollbar-hide">
              <MDXRenderer theme="dark" mdxSource={section.content} />
            </div>
          </div>
        ))}
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionContent;
