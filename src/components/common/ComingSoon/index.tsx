import { useState } from 'react';
import { FlexContainer, Image, Section, Text, Toast } from '@/components';
import { Button } from '@/components';
import { useApi, useUser } from '@/hooks';
import { STATIC_FILE_PATH } from '@/constant';

interface ComingSoonProps {
  className?: string;
}

const ComingSoon = ({ className = '' }: ComingSoonProps) => {
  const { user, isAuth } = useUser();
  const { makeRequest } = useApi('user-interest');
  const [isLoading, setIsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const subscriptionFeatures = [
    'Advanced Interview Questions with AI Feedback',
    'Personalized Learning Paths',
    'Premium System Design Templates',
    'Direct Mentor Access',
    'Priority Support & Community',
    'Exclusive Workshops & Events'
  ];

  const handleInterestClick = async () => {
    if (!isAuth || !user?.id) {
      setToast({
        message: 'Please login to show your interest',
        type: 'error'
      });
      return;
    }

    if (isInterested) {
      setToast({
        message: 'You\'re already on our interest list!',
        type: 'success'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { status } = await makeRequest({
        method: 'POST',
        url: '/user/interest',
        body: {
          userId: user.id,
          eventType: 'WEBAPP_SUBSCRIPTION',
          eventDescription: 'User interested in webapp subscription from home page',
          metadata: {
            page: 'home',
            timestamp: new Date().toISOString(),
          },
          source: 'WEBAPP',
        },
      });

      if (status) {
        setIsInterested(true);
        setToast({
          message: 'Thanks! We\'ll notify you when subscription launches 🚀',
          type: 'success'
        });
      } else {
        setToast({
          message: 'Something went wrong. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error showing interest:', error);
      setToast({
        message: 'Failed to register interest. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section className={`md:px-8 md:py-6 px-2 py-6 ${className}`}>
      <FlexContainer justifyCenter={false}>
        <FlexContainer className='w-full gap-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 md:px-8 md:py-8 px-4 py-6 shadow-xl border border-blue-200 lg:px-6 lg:py-6'>
          <div className='max-w-sm lg:max-w-md'>
            <Image 
              alt='subscription coming soon' 
              src={`${STATIC_FILE_PATH.svg}/rocket.svg`}
              className='w-full h-auto'
            />
          </div>
          
          <FlexContainer direction='col' itemCenter className='flex-1 text-center lg:text-left'>
            <div className='mb-4'>
              <div className='inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium mb-3'>
                🚀 Coming Soon
              </div>
              <Text className='heading-2 text-gray-800 mb-2' level='h2'>
                TBE Premium Subscription
              </Text>
              <Text className='paragraph text-gray-600 mb-4' level='p'>
                Get ready for the ultimate learning experience with premium features designed for serious learners.
              </Text>
            </div>

            <div className='mb-6 text-left w-full max-w-md'>
              <Text className='font-semibold text-gray-700 mb-3' level='p'>
                What's Coming:
              </Text>
              <ul className='space-y-2'>
                {subscriptionFeatures.map((feature, index) => (
                  <li key={index} className='flex items-start text-sm text-gray-600'>
                    <span className='text-green-500 mr-2 mt-0.5'>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 items-center'>
              <Button
                variant={isInterested ? 'OUTLINE' : 'PRIMARY'}
                text={
                  isLoading 
                    ? 'Registering...' 
                    : isInterested 
                      ? 'Interest Registered ✓' 
                      : 'Interested? 🚀'
                }
                onClick={handleInterestClick}
                disabled={isLoading || isInterested}
                className='px-6 py-3 font-medium transition-all duration-200 hover:scale-105'
              />
              
              {!isAuth && (
                <Text className='text-xs text-gray-500' level='span'>
                  Login required to show interest
                </Text>
              )}
            </div>

            <div className='mt-4 text-center'>
              <Text className='text-xs text-gray-500' level='p'>
                Be the first to know when we launch • No spam, ever
              </Text>
            </div>
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Section>
  );
};

export default ComingSoon;