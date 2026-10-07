import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

const GITHUB_REPO_URL = 'https://github.com/The-Boring-Education/TBE-Web';

export const TopContributorsSection: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const loadContributors = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch from local static contributors.json
        const res = await fetch('/contributors.json');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const filtered = data.filter(
              (c: any) => c?.login?.toLowerCase() !== 'claude',
            );
            setContributors(filtered);
            setIsLoading(false);
            return;
          }
        }

        // 2. Direct GitHub API fallback
        const ghRes = await fetch(
          'https://api.github.com/repos/The-Boring-Education/TBE-Web/contributors?per_page=30',
        );
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          if (isMounted && Array.isArray(ghData)) {
            const isBot = (c: any) =>
              !c ||
              !c.login ||
              c.type === 'Bot' ||
              c.login.toLowerCase().endsWith('[bot]') ||
              c.login.toLowerCase().includes('bot') ||
              c.login === 'actions-user' ||
              c.login === 'cursoragent' ||
              c.login.toLowerCase() === 'claude';

            const parsed: Contributor[] = ghData
              .filter((c: any) => !isBot(c))
              .map((c: any) => ({
                id: c.id,
                login: c.login,
                avatar_url: c.avatar_url,
                html_url: c.html_url,
                contributions: c.contributions,
              }));

            if (parsed.length > 0) {
              setContributors(parsed);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load contributors dynamically:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadContributors();

    return () => {
      isMounted = false;
    };
  }, []);

  // Default show 5 contributors, expand to 10 when user clicks "View more"
  const visibleContributors = useMemo(() => {
    const limit = isExpanded ? 10 : 5;
    return contributors.slice(0, limit);
  }, [contributors, isExpanded]);

  const canExpand = contributors.length > 5;

  const handleImageError = (login: string) => {
    setImgErrors((prev) => ({ ...prev, [login]: true }));
  };

  return (
    <section
      id='open-source-contributors'
      className={`mx-auto max-w-6xl px-4 py-8 sm:px-6 select-none ${className}`}
    >
      <div className='space-y-6'>
        {/* Centered Heading */}
        <div className='flex flex-col items-center text-center space-y-2'>
          <div className='inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-3 py-0.5 text-[11px] font-medium text-zinc-600 shadow-2xs'>
            <span className='h-1.5 w-1.5 rounded-full bg-[#FF5757]' />
            <span>Open Source Community</span>
          </div>

          <h3 className='text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight'>
            People Behind <span className='text-[#FF5757]'>The Code</span>
          </h3>

          <p className='max-w-xl text-xs sm:text-sm text-zinc-600'>
            Meet the active contributors, builders, and developers shaping{' '}
            <a
              href={GITHUB_REPO_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='font-semibold text-zinc-800 hover:text-[#FF5757] underline decoration-zinc-300 underline-offset-2 transition-colors'
            >
              TBE-Web
            </a>{' '}
            on GitHub.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && contributors.length === 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex flex-col items-center justify-center rounded-xl border border-zinc-100 bg-white p-4 text-center animate-pulse'
              >
                <div className='h-14 w-14 rounded-full bg-zinc-200 mb-3' />
                <div className='h-3.5 w-20 rounded bg-zinc-200 mb-2' />
                <div className='h-3 w-12 rounded bg-zinc-100' />
              </div>
            ))}
          </div>
        ) : (
          /* Minimal Aesthetic Contributors Grid */
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5'>
            {visibleContributors.map((contributor) => {
              const hasImgError = imgErrors[contributor.login];
              const initialLetter = (contributor.login || '?')
                .charAt(0)
                .toUpperCase();

              return (
                <a
                  key={contributor.id || contributor.login}
                  href={contributor.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex flex-col items-center justify-center rounded-xl border border-zinc-200/70 bg-white p-3.5 sm:p-4 text-center transition-all duration-200 hover:border-zinc-300 hover:shadow-xs'
                >
                  {/* Centered Photo */}
                  <div className='mb-2.5 flex items-center justify-center'>
                    <div className='h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full ring-1 ring-zinc-200 group-hover:ring-[#FF5757]/60 transition-all duration-200 bg-zinc-50'>
                      {!hasImgError && contributor.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-200'
                          loading='lazy'
                          onError={() => handleImageError(contributor.login)}
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center font-bold text-zinc-600 text-sm'>
                          {initialLetter}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contributor Name - Full, uncropped with clean wrapping */}
                  <p className='w-full text-xs font-semibold text-zinc-900 transition-colors duration-150 group-hover:text-[#FF5757] break-all leading-tight'>
                    @{contributor.login}
                  </p>

                  {/* Contribution Count */}
                  <span className='mt-1 text-[10px] sm:text-[11px] font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors duration-150'>
                    {contributor.contributions}{' '}
                    {contributor.contributions === 1 ? 'commit' : 'commits'}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Minimal Toggle Control */}
        {canExpand && (
          <div className='flex justify-center pt-1'>
            <button
              type='button'
              id='view-more-contributors-btn'
              onClick={() => setIsExpanded((prev) => !prev)}
              className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-all duration-150 hover:bg-zinc-50 hover:text-zinc-900 active:scale-98'
            >
              <span>{isExpanded ? 'Show less' : 'View more'}</span>
              {isExpanded ? (
                <ChevronUp className='h-3.5 w-3.5 text-zinc-500' />
              ) : (
                <ChevronDown className='h-3.5 w-3.5 text-zinc-500' />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopContributorsSection;
