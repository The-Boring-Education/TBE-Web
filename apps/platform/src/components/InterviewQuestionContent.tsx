import { FaRegStar, FaStar } from 'react-icons/fa';

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
  const proseClass = `prose max-w-none prose-red prose-headings:scroll-mt-6 ${
    isDark ? 'prose-invert' : ''
  }`;

  return (
    <div className='w-full flex flex-col'>
      {/* Sleek Minimal Title */}
      <div className='flex items-start justify-between gap-4 mb-4'>
        <h1
          className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-contentLight'
          }`}
        >
          {questionTitle}
        </h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar?.();
          }}
          className={`p-1.5 rounded-full transition-all duration-200 active:scale-95 shrink-0 cursor-pointer text-xl ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
          }`}
          aria-label={isStarred ? 'Unstar question' : 'Star question'}
        >
          {isStarred ? (
            <FaStar className='text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' />
          ) : (
            <FaRegStar
              className={
                isDark
                  ? 'text-white/30 hover:text-white/60'
                  : 'text-gray-400 hover:text-gray-600'
              }
            />
          )}
        </button>
      </div>

      {/* Sleek aesthetic breadcrumb & priority / frequency / companies row */}
      <div
        className={`flex items-center gap-3 text-xs pb-4 border-b mb-6 flex-wrap ${
          isDark
            ? 'text-gray-400 border-gray-900'
            : 'text-gray-500 border-gray-200'
        }`}
      >
        {priority && (
          <span className='text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded'>
            {priority} Priority
          </span>
        )}
        {frequency && (
          <>
            {priority && (
              <span
                className={`font-semibold ${isDark ? 'text-gray-700' : 'text-gray-300'}`}
              >
                •
              </span>
            )}
            <span
              className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {frequency}
            </span>
          </>
        )}
        {companyTypes && companyTypes.length > 0 && (
          <>
            {(priority || frequency) && (
              <span
                className={`font-semibold ${isDark ? 'text-gray-700' : 'text-gray-300'}`}
              >
                •
              </span>
            )}
            <div className='flex items-center gap-1.5 flex-wrap'>
              {companyTypes.map((ct) => (
                <span
                  key={ct}
                  className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {ct}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Structured Content matching Core Subjects */}
      <div className='space-y-8 w-full'>
        {question && (
          <div
            className={`space-y-4 pb-8 border-b ${isDark ? 'border-gray-900' : 'border-gray-200'}`}
          >
            <h2 className='text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2'>
              <span className='w-4 h-[2px] bg-red-500 rounded-full' />
              Problem Statement
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
        <div
          className={`mt-8 pt-6 border-t flex flex-wrap items-center gap-2 ${
            isDark ? 'border-gray-900' : 'border-gray-200'
          }`}
        >
          {actions}
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionContent;
