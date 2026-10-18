import {
  Bookmark,
  Briefcase,
  Building2,
  Flame,
  Gauge,
  Repeat,
} from 'lucide-react';

import { InterviewSheetMDXRenderer } from './InterviewSheetMDXRenderer';

interface InterviewQuestionContentProps {
  questionTitle: string;
  question: string;
  answer: string;
  frequency?: string;
  priority?: string;
  difficulty?: string;
  role?: string;
  companyTypes?: string[];
  actions?: React.ReactNode[];
  isStarred?: boolean;
  onToggleStar?: () => void;
  theme?: 'light' | 'dark';
}

const PRIORITY_TAG_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const DARK_TAG_STYLE = 'bg-white/5 text-gray-300 border-white/10';
const LIGHT_TAG_STYLE = 'bg-muted/40 text-muted-foreground border-border/80';

const InterviewQuestionContent = ({
  questionTitle,
  question,
  answer,
  frequency,
  priority,
  difficulty,
  role,
  companyTypes,
  actions,
  isStarred,
  onToggleStar,
  theme = 'light',
}: InterviewQuestionContentProps) => {
  const isDark = theme === 'dark';
  const neutralTagClass = isDark ? DARK_TAG_STYLE : LIGHT_TAG_STYLE;
  const priorityTagClass = isDark
    ? DARK_TAG_STYLE
    : PRIORITY_TAG_STYLES[priority?.toLowerCase() ?? ''] || LIGHT_TAG_STYLE;
  const tagBaseClass =
    'inline-flex items-center gap-1.5 text-[11px] font-semibold border px-2.5 py-1 rounded-full';
  const hasCredibilityTags = Boolean(
    priority ||
    frequency ||
    difficulty ||
    role ||
    (companyTypes && companyTypes.length > 0),
  );

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

      {/* Credibility Row: Priority, Frequency, Difficulty, Role, Company Types */}
      {hasCredibilityTags && (
        <div
          className={`flex items-center gap-2 text-xs pb-3.5 border-b mb-4 flex-wrap ${
            isDark
              ? 'text-gray-400 border-gray-800'
              : 'text-muted-foreground border-border/80'
          }`}
        >
          {priority && (
            <span
              className={`${tagBaseClass} ${priorityTagClass}`}
              title={`Marked as ${priority} priority by interview mentors`}
            >
              <Flame className='w-3.5 h-3.5' aria-hidden='true' />
              {priority} Priority
            </span>
          )}
          {frequency && (
            <span
              className={`${tagBaseClass} ${neutralTagClass}`}
              title='How often this question shows up in reported interviews'
            >
              <Repeat className='w-3.5 h-3.5' aria-hidden='true' />
              {frequency}
            </span>
          )}
          {difficulty && (
            <span
              className={`${tagBaseClass} ${neutralTagClass}`}
              title={`Difficulty level: ${difficulty}`}
            >
              <Gauge className='w-3.5 h-3.5' aria-hidden='true' />
              {difficulty}
            </span>
          )}
          {role && (
            <span
              className={`${tagBaseClass} ${neutralTagClass}`}
              title={`Asked for ${role} roles`}
            >
              <Briefcase className='w-3.5 h-3.5' aria-hidden='true' />
              {role} Role
            </span>
          )}
          {companyTypes && companyTypes.length > 0 && (
            <span
              className={`${tagBaseClass} ${neutralTagClass}`}
              title={`Reported in interviews at ${companyTypes.join(', ')}`}
            >
              <Building2 className='w-3.5 h-3.5' aria-hidden='true' />
              Asked at {companyTypes.join(' · ')}
            </span>
          )}
        </div>
      )}

      {/* Structured Content matching core interview layout */}
      <div className='space-y-4 w-full'>
        {question && (
          <div className='space-y-1.5'>
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
          <div className='space-y-2'>
            <div className={proseClass}>
              <InterviewSheetMDXRenderer mdxSource={answer} theme={theme} />
            </div>
          </div>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className='mt-5 pt-4 border-t border-border/80 w-full flex flex-wrap items-center gap-3'>
          {actions}
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionContent;
