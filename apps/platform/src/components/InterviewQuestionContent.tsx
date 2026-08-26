import { Bookmark } from 'lucide-react';

import { InterviewSheetMDXRenderer } from './InterviewSheetMDXRenderer';

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
  theme?: 'light' | 'dark';
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
  theme = 'light',
}: InterviewQuestionContentProps) => {
  const isDark = theme === 'dark';
  const proseClass = `prose max-w-none prose-headings:scroll-mt-6 prose-strong:font-semibold prose-code:font-mono prose-code:text-xs prose-code:sm:text-[13px] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none ${
    isDark
      ? 'prose-invert prose-code:bg-muted/40 prose-code:text-red-400 prose-code:border prose-code:border-gray-800'
      : 'prose-code:bg-red-50 prose-code:text-primary prose-code:border prose-code:border-red-200/50'
  }`;

  return (
    <div className='w-full flex flex-col font-primary'>
      {/* Question Title and Bookmark */}
      <div className='flex items-start justify-between gap-4 mb-3'>
        <h1
          className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${
            isDark ? 'text-white' : 'text-foreground'
          }`}
        >
          {questionTitle}
        </h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.();
          }}
          className='p-1 rounded-md transition-all duration-200 active:scale-95 shrink-0 cursor-pointer text-primary hover:bg-primary/5'
          aria-label={isStarred ? 'Unstar question' : 'Star question'}
        >
          <Bookmark
            className={`w-4 h-4 transition-colors ${
              isStarred
                ? 'fill-primary text-primary'
                : 'text-primary hover:text-primary/80'
            }`}
          />
        </button>
      </div>

      {/* Metadata Row: Priority, Frequency, Company Types */}
      <div
        className={`flex items-center gap-3 text-xs pb-5 border-b mb-6 flex-wrap ${
          isDark
            ? 'text-gray-400 border-gray-800'
            : 'text-muted-foreground border-border/80'
        }`}
      >
        {priority && (
          <span className='text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md'>
            {priority} Priority
          </span>
        )}
        {frequency && (
          <>
            {priority && (
              <span className='font-bold text-muted-foreground/50'>·</span>
            )}
            <span className='font-medium text-muted-foreground text-xs'>
              {frequency}
            </span>
          </>
        )}
        {companyTypes && companyTypes.length > 0 && (
          <>
            {(priority || frequency) && (
              <span className='font-bold text-muted-foreground/50'>·</span>
            )}
            <div className='flex items-center gap-1.5 flex-wrap'>
              {companyTypes.map((ct) => (
                <span
                  key={ct}
                  className='font-medium text-muted-foreground text-xs'
                >
                  {ct}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Structured Content matching core interview layout */}
      <div className='space-y-6 w-full'>
        {question && (
          <div className='space-y-3'>
            <h2 className='text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5'>
              <span className='font-bold'>—</span>
              <span>PROBLEM STATEMENT</span>
            </h2>
            <div className={proseClass}>
              <InterviewSheetMDXRenderer mdxSource={question} theme={theme} />
            </div>
          </div>
        )}

        {answer && (
          <div className='space-y-4'>
            <div className={proseClass}>
              <InterviewSheetMDXRenderer mdxSource={answer} theme={theme} />
            </div>
          </div>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className='mt-8 pt-6 border-t border-border/80 w-full flex flex-wrap items-center gap-3'>
          {actions}
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionContent;
