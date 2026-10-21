import { ArrowRight, BarChart2, Clock, Inbox } from 'lucide-react';
import React from 'react';

import { getTechMeta, QuizTechIcon } from './QuizTechIcon';

export interface QuizCardData {
  id: string;
  title: string;
  description: string;
  icon?: string;
  categoryBadge?: string;
  categoryColor?: string;
  questionsCount?: number;
  durationMinutes?: number;
  popularity?: string;
}

interface QuizCardProps {
  quiz: QuizCardData;
  onStart: (id: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
  const meta = getTechMeta(quiz.title || quiz.icon || '');

  const badgeText = quiz.categoryBadge || meta.category;
  const badgeClass = quiz.categoryColor || meta.categoryColor;
  const questionsCount = quiz.questionsCount || meta.defaultQuestions;
  const duration = quiz.durationMinutes || meta.defaultMinutes;
  const popularity = quiz.popularity || meta.defaultPopularity;

  return (
    <div
      onClick={() => onStart(quiz.id)}
      className='bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group cursor-pointer h-full'
    >
      {/* Top Header Block: Logo + Title + Untrimmed Description + Category Badge */}
      <div>
        <div className='flex items-start justify-between gap-2.5'>
          {/* Tech Logo */}
          <div className='w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-50/90 border border-gray-100 group-hover:scale-105 transition-transform mt-0.5'>
            <QuizTechIcon
              nameOrIcon={quiz.title || quiz.icon || ''}
              className='w-6 h-6'
            />
          </div>

          {/* Title and Untrimmed Description */}
          <div className='flex-1 min-w-0'>
            <h3 className='font-bold text-[14px] sm:text-[15px] text-gray-900 group-hover:text-[#EF4444] transition-colors leading-snug'>
              {quiz.title}
            </h3>
            <p className='text-xs text-gray-500 font-normal leading-relaxed mt-1'>
              {quiz.description}
            </p>
          </div>

          {/* Category Pill Badge at top-right */}
          <span
            className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap self-start ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>
      </div>

      {/* Bottom Block: Metadata Row directly above Start Quiz Button (no huge gap) */}
      <div className='mt-4 sm:mt-5'>
        {/* Metadata Row: Inbox Drawer + Clock + Bar Chart */}
        <div className='flex items-center justify-between text-xs text-gray-500 font-medium mb-3 px-0.5'>
          {/* Question count */}
          <div className='flex items-center gap-1.5 shrink-0'>
            <Inbox className='w-3.5 h-3.5 text-gray-400 shrink-0' />
            <span className='whitespace-nowrap'>{questionsCount} Qs</span>
          </div>

          {/* Duration */}
          <div className='flex items-center gap-1.5 shrink-0'>
            <Clock className='w-3.5 h-3.5 text-gray-400 shrink-0' />
            <span className='whitespace-nowrap'>{duration} mins</span>
          </div>

          {/* Popularity */}
          <div className='flex items-center gap-1.5 shrink-0'>
            <BarChart2 className='w-3.5 h-3.5 text-gray-400 shrink-0' />
            <span className='whitespace-nowrap'>{popularity}</span>
          </div>
        </div>

        {/* Start Quiz Action Button */}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onStart(quiz.id);
          }}
          className='w-full h-10 bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer shrink-0'
        >
          <span>Start Quiz</span>
          <ArrowRight className='w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-1' />
        </button>
      </div>
    </div>
  );
};
