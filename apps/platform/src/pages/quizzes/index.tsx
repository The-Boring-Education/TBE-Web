import { useAuth } from '@tbe/auth';
import { LoadingSpinner, SEO } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Code,
  Play,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useState } from 'react';

function QuizesClient() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-redirect authenticated users to quizzes dashboard
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user && !isRedirecting) {
      if (user.id) {
        setIsRedirecting(true);
        router.push('/quizzes/dashboard');
      }
    }
  }, [user, isAuthenticated, isLoading, router, isRedirecting]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/quizzes/dashboard');
    } else {
      router.push(
        '/login?redirect=/quizzes/dashboard&returnTo=/quizzes/dashboard',
      );
    }
  };

  return (
    <div className='min-h-screen bg-white text-black'>
      {/* Show loading state while auth is loading */}
      {isLoading && (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <LoadingSpinner label='Loading...' />
        </div>
      )}

      {/* Show redirecting state */}
      {isRedirecting && (
        <div className='min-h-[60vh] flex items-center justify-center'>
          <LoadingSpinner label='Redirecting to your dashboard...' />
        </div>
      )}

      {/* Show main landing content only when not loading or redirecting */}
      {!isLoading && !isRedirecting && (
        <>
          {/* Hero Section */}
          <div className='container mx-auto px-4 py-16'>
            <div className='max-w-6xl mx-auto'>
              {/* Logo and Branding */}
              <div className='mb-12'>
                <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4'>
                  <Sparkles className='w-4 h-4' />
                  Interactive Technical Assessments
                </div>
                <h1 className='text-5xl md:text-7xl font-extrabold text-black mb-4 leading-tight tracking-tight'>
                  Master Tech Interviews with{' '}
                  <span className='text-primary block sm:inline'>Quizzes</span>
                </h1>
                <p className='text-xl md:text-2xl text-gray-600 font-medium max-w-3xl'>
                  Test your skills, learn from detailed explanations, and track
                  your progress across frontend, backend, DSA, and modern
                  frameworks.
                </p>
              </div>

              {/* Value Proposition */}
              <div className='grid lg:grid-cols-2 gap-12 items-center mb-16'>
                <div>
                  <p className='text-lg text-gray-700 mb-8 leading-relaxed'>
                    Practice with carefully curated, industry-aligned questions
                    covering JavaScript, React, algorithms, and core computer
                    science concepts. Get instant feedback and climb the
                    leaderboard.
                  </p>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <button
                      onClick={handleGetStarted}
                      className='inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg text-lg cursor-pointer'
                    >
                      Start Practicing Free
                      <ArrowRight className='ml-2 w-5 h-5' />
                    </button>
                    <button
                      onClick={() => router.push('/quizzes/dashboard')}
                      className='inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all text-lg cursor-pointer'
                    >
                      Browse Topics
                    </button>
                  </div>
                </div>

                <div className='relative'>
                  <div className='bg-gray-50 rounded-2xl p-8 border-2 border-gray-100 shadow-sm'>
                    <div className='space-y-5'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold'>
                            JS
                          </div>
                          <div>
                            <span className='font-bold text-gray-900 block'>
                              JavaScript Fundamentals
                            </span>
                            <span className='text-xs text-gray-500'>
                              Closures, Event Loop, Promises
                            </span>
                          </div>
                        </div>
                        <CheckCircle className='w-6 h-6 text-green-500' />
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 overflow-hidden'>
                        <div className='bg-primary h-2.5 rounded-full w-3/4' />
                      </div>
                      <div className='flex justify-between text-xs text-gray-600 font-medium'>
                        <span>15 questions completed</span>
                        <span className='text-primary font-semibold'>
                          Score: 92%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className='bg-gray-50 py-20 border-y border-gray-100'>
            <div className='container mx-auto px-4'>
              <div className='max-w-6xl mx-auto'>
                <div className='text-center mb-16'>
                  <h3 className='text-3xl md:text-4xl font-bold mb-4 text-gray-900'>
                    Everything You Need to Ace Tech Interviews
                  </h3>
                  <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                    Built to help you bridge knowledge gaps through active
                    recall and hands-on practice.
                  </p>
                </div>

                <div className='grid md:grid-cols-3 gap-8'>
                  <div className='bg-white rounded-2xl p-8 border border-gray-200 shadow-xs text-center'>
                    <div className='w-14 h-14 bg-red-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-6'>
                      <Target className='w-7 h-7' />
                    </div>
                    <h4 className='text-xl font-bold mb-3 text-gray-900'>
                      Curated Questions
                    </h4>
                    <p className='text-gray-600 leading-relaxed text-sm'>
                      Hand-picked questions reflecting real interview screening
                      rounds at top product companies.
                    </p>
                  </div>

                  <div className='bg-white rounded-2xl p-8 border border-gray-200 shadow-xs text-center'>
                    <div className='w-14 h-14 bg-red-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-6'>
                      <Clock className='w-7 h-7' />
                    </div>
                    <h4 className='text-xl font-bold mb-3 text-gray-900'>
                      Timed Simulation
                    </h4>
                    <p className='text-gray-600 leading-relaxed text-sm'>
                      Practice under real-time constraints to build speed,
                      accuracy, and confidence.
                    </p>
                  </div>

                  <div className='bg-white rounded-2xl p-8 border border-gray-200 shadow-xs text-center'>
                    <div className='w-14 h-14 bg-red-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-6'>
                      <Brain className='w-7 h-7' />
                    </div>
                    <h4 className='text-xl font-bold mb-3 text-gray-900'>
                      In-Depth Explanations
                    </h4>
                    <p className='text-gray-600 leading-relaxed text-sm'>
                      Understand why answers are right or wrong with code
                      snippets and conceptual breakdowns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className='bg-white py-20'>
            <div className='container mx-auto px-4'>
              <div className='max-w-4xl mx-auto'>
                <div className='text-center mb-16'>
                  <h3 className='text-3xl md:text-4xl font-bold mb-4 text-black'>
                    Proven Learning Impact
                  </h3>
                  <p className='text-lg text-gray-600'>
                    Join thousands of developers sharpening their engineering
                    intuition.
                  </p>
                </div>

                <div className='grid md:grid-cols-3 gap-8 text-center'>
                  <div className='border border-gray-200 rounded-2xl p-8 bg-white shadow-xs'>
                    <div className='w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4'>
                      <Code className='w-6 h-6 text-primary' />
                    </div>
                    <div className='text-4xl font-extrabold mb-2 text-gray-900'>
                      100+
                    </div>
                    <div className='text-gray-600 font-medium'>
                      Practice Questions
                    </div>
                  </div>

                  <div className='border border-gray-200 rounded-2xl p-8 bg-white shadow-xs'>
                    <div className='w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4'>
                      <Users className='w-6 h-6 text-primary' />
                    </div>
                    <div className='text-4xl font-extrabold mb-2 text-gray-900'>
                      10,000+
                    </div>
                    <div className='text-gray-600 font-medium'>
                      Active Learners
                    </div>
                  </div>

                  <div className='border border-gray-200 rounded-2xl p-8 bg-white shadow-xs'>
                    <div className='w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4'>
                      <Trophy className='w-6 h-6 text-primary' />
                    </div>
                    <div className='text-4xl font-extrabold mb-2 text-gray-900'>
                      85%
                    </div>
                    <div className='text-gray-600 font-medium'>
                      Completion Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Preview */}
          <div className='bg-gray-50 py-20 border-t border-gray-100'>
            <div className='container mx-auto px-4'>
              <div className='max-w-6xl mx-auto'>
                <div className='text-center mb-16'>
                  <h3 className='text-3xl md:text-4xl font-bold mb-4 text-black'>
                    Choose Your Focus Area
                  </h3>
                  <p className='text-lg text-gray-600'>
                    Practice questions tailored to specific languages,
                    libraries, and core subjects.
                  </p>
                </div>

                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {[
                    {
                      name: 'JavaScript',
                      questions: '15+ questions',
                      icon: Code,
                      description: 'ES6+, Event Loop, Types, Scope',
                    },
                    {
                      name: 'React',
                      questions: '12+ questions',
                      icon: Target,
                      description: 'Hooks, Fiber, State, Optimization',
                    },
                    {
                      name: 'Algorithms',
                      questions: '10+ questions',
                      icon: Brain,
                      description: 'Complexity, Patterns, Sorting',
                    },
                    {
                      name: 'Web Development',
                      questions: '8+ questions',
                      icon: Clock,
                      description: 'HTTP, Security, DOM, Performance',
                    },
                  ].map((category, index) => (
                    <div
                      key={index}
                      onClick={() => router.push('/quizzes/dashboard')}
                      className='bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group'
                    >
                      <category.icon className='w-8 h-8 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform' />
                      <h4 className='font-bold text-lg mb-1 text-black'>
                        {category.name}
                      </h4>
                      <p className='text-primary text-xs font-semibold mb-2'>
                        {category.questions}
                      </p>
                      <p className='text-gray-500 text-xs'>
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className='bg-white py-20'>
            <div className='container mx-auto px-4'>
              <div className='max-w-4xl mx-auto text-center'>
                <h3 className='text-3xl md:text-5xl font-bold mb-6 text-black'>
                  Ready to Test Your Tech Skills?
                </h3>
                <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto'>
                  Jump right in to start practicing. No pressure, just quick
                  daily practice that compounds over time.
                </p>
                <button
                  onClick={handleGetStarted}
                  className='inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md text-lg cursor-pointer'
                >
                  <Play className='mr-2 w-5 h-5' />
                  Start a Quiz Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const QuizzesLandingPage = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <QuizesClient />
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: '/quizzes', appId: 'platform' })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default QuizzesLandingPage;
