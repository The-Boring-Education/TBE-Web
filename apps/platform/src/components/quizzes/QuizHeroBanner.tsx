import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface QuizHeroBannerProps {
  onStartPracticing?: () => void;
}

export const QuizHeroBanner: React.FC<QuizHeroBannerProps> = ({
  onStartPracticing,
}) => {
  return (
    <div className='relative overflow-hidden rounded-[18px] border border-red-100/80 bg-gradient-to-r from-[#FFF5F3] via-[#FFF9F8] to-[#FFF5F3] px-5 sm:px-7 lg:px-8 py-4 sm:py-5 shadow-xs mb-4 sm:mb-5 w-full min-h-[210px] md:h-[220px] flex items-center'>
      {/* Decorative ambient radial glows */}
      <div className='pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-red-400/10 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-orange-300/15 blur-3xl' />

      <div className='relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center w-full'>
        {/* Left Column: Typography & CTAs */}
        <div className='md:col-span-7 lg:col-span-8 flex flex-col justify-center'>
          {/* Sub-label */}
          <div className='flex items-center gap-2 mb-1.5'>
            <span className='text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500'>
              PRACTICE &times; LEARN &times; IMPROVE
            </span>
          </div>

          {/* Heading */}
          <h1 className='text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 tracking-tight leading-[1.15] mb-1.5'>
            Level Up Your{' '}
            <span className='text-[#EF4444] inline-block'>
              Technical Skills
            </span>
          </h1>

          {/* Subtitle */}
          <p className='text-xs sm:text-[13px] text-gray-600 font-normal leading-relaxed max-w-lg mb-3.5'>
            Take quizzes, test your knowledge and strengthen your concepts with
            hands-on practice. One quiz at a time.
          </p>

          {/* Action Row: CTA */}
          <div className='flex items-center'>
            <button
              type='button'
              onClick={onStartPracticing}
              className='inline-flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all cursor-pointer transform hover:-translate-y-0.5'
            >
              <span>Start Practicing</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Right Column: 3D Mascot + Badge Illustration (compact & fitted) */}
        <div className='hidden md:flex md:col-span-5 lg:col-span-4 relative items-center justify-end h-full'>
          {/* Top Right Curved Annotation: "Consistent Practice Better You. ->" */}
          <div className='hidden lg:flex absolute -top-2 right-0 items-center gap-1.5 z-20'>
            <svg
              className='w-5 h-5 text-[#EF4444] transform -scale-x-100 rotate-12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14 5l7 7m0 0l-7 7m7-7H3'
              />
            </svg>
            <div className='flex flex-col'>
              <span className='text-[10px] font-semibold italic text-gray-700 leading-tight'>
                Consistent Practice
              </span>
              <span className='text-[10px] font-bold text-[#EF4444] leading-tight flex items-center gap-1'>
                Better You. &rarr;
              </span>
            </div>
          </div>

          {/* Floating "Small Quizzes Big Progress" 3D Badge */}
          <div className='hidden md:block absolute -top-1 left-2 sm:left-4 w-28 lg:w-32 z-20 pointer-events-none select-none'>
            <Image
              src='https://ik.imagekit.io/riufvimprm/TBE/small-quizzes-bigger-progress.png'
              alt='Small Quizzes Big Progress'
              width={140}
              height={95}
              className='object-contain drop-shadow-sm select-none pointer-events-none'
              priority
              unoptimized
            />
          </div>

          {/* Main 3D Mascot Image - strictly bounded within 185px height */}
          <div className='relative flex items-center justify-center h-[175px] sm:h-[185px] w-auto'>
            <Image
              src='https://ik.imagekit.io/riufvimprm/TBE/tbe-quiz-dashboard-mascot.png'
              alt='TBE Tech Quiz Mascot'
              width={340}
              height={185}
              className='max-h-[185px] w-auto object-contain select-none pointer-events-none drop-shadow-md'
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
};
