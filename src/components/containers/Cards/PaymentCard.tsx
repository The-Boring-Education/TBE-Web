import {
  BanknotesIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  StarIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import React, { useState } from 'react';

import { Button, FlexContainer, Section, Text } from '@/components';
import { routes } from '@/constant';
import { useCashfreePayment, useUser } from '@/hooks';
import type { PaymentCardProps } from '@/interfaces';

const PaymentCard = ({ course, onClose, productType }: PaymentCardProps) => {
  const { user } = useUser();
  const {
    isCashfreeLoaded,
    error: sdkError,
    launchPayment,
  } = useCashfreePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product type specific content
  const isInterviewSheet = productType === 'INTERVIEW_SHEET';
  const productName = isInterviewSheet ? 'Interview Sheet' : 'Course';
  const productIcon = isInterviewSheet ? ShieldCheckIcon : BookOpenIcon;

  // Dynamic reasons to buy based on product type
  const reasonsToBuy = isInterviewSheet
    ? [
        {
          icon: ShieldCheckIcon,
          title: 'Real Interview Questions',
          description: 'Questions asked in actual FAANG and top-tier companies',
        },
        {
          icon: StarIcon,
          title: 'Expert Solutions',
          description:
            'Detailed explanations and optimal approaches for each question',
        },
        {
          icon: LightBulbIcon,
          title: 'Interview Insights',
          description:
            'Pro tips and common mistakes to avoid during interviews',
        },
        {
          icon: ClockIcon,
          title: 'Save 100+ Hours',
          description:
            'Curated content saves months of research and preparation',
        },
      ]
    : [
        {
          icon: BookOpenIcon,
          title: 'Comprehensive Learning',
          description: 'Complete hands-on course with practical projects',
        },
        {
          icon: StarIcon,
          title: 'Industry Relevant',
          description:
            'Latest technologies and best practices used in industry',
        },
        {
          icon: CheckCircleIcon,
          title: 'Completion Certificate',
          description: 'Get verified certificate upon successful completion',
        },
        {
          icon: ClockIcon,
          title: 'Lifetime Access',
          description:
            'Learn at your own pace with permanent access to content',
        },
      ];

  const createPaymentOrder = async (): Promise<string> => {
    const response = await fetch(
      `${routes.api.base}${routes.api.createOrder}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          productId: course._id,
          productType,
          amount: course.price,
          customerName: user?.name,
          customerEmail: user?.email,
          ...(((course as any).appliedCoupon) && {
            appliedCoupon: (course as any).appliedCoupon._id,
            couponCode: (course as any).appliedCoupon.code,
          }),
        }),
      }
    );

    const data = await response.json();

    if (!data.status || !data.data?.paymentSessionId) {
      throw new Error(data.message || 'Failed to create order');
    }

    return data.data.paymentSessionId;
  };

  const handlePayment = async () => {
    if (!isCashfreeLoaded) {
      setError('Payment gateway is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const paymentSessionId = await createPaymentOrder();
      await launchPayment(
        paymentSessionId,
        (_successData) => {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        (_failureData) => {
          setError('Payment failed. Please try again.');
          setIsProcessing(false);
        },
        () => {
          setIsProcessing(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <Section className='mt-8 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200'>
        <FlexContainer className='justify-between items-center'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
              <BookOpenIcon className='w-5 h-5 text-blue-600' />
            </div>
            <Text level='h3' className='heading-4 text-gray-800'>
              Complete Your Purchase
            </Text>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors'
          >
            <XMarkIcon className='w-5 h-5' />
          </button>
        </FlexContainer>
      </div>

      <div className='p-6 space-y-8'>
        {/* Product Highlight */}
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
          <div className='flex items-start gap-4'>
            <div className='p-3 bg-blue-100 rounded-lg'>
              {React.createElement(productIcon, {
                className: 'w-8 h-8 text-blue-600',
              })}
            </div>
            <div className='flex-1'>
              <Text level='h3' className='font-bold text-gray-900 mb-2'>
                {course.name}
              </Text>
              <Text level='p' className='text-gray-700 leading-relaxed'>
                {course.description ||
                  `Premium ${productName.toLowerCase()} designed to accelerate your learning and career growth.`}
              </Text>
            </div>
          </div>
        </div>

        {/* Why This Is Worth It */}
        <div>
          <Text
            level='h3'
            className='font-bold text-gray-900 mb-4 flex items-center gap-2'
          >
            <StarIcon className='w-5 h-5 text-yellow-500' />
            Why thousands choose our premium {productName.toLowerCase()}s
          </Text>
          <div className='grid md:grid-cols-2 gap-4'>
            {reasonsToBuy.map(({ icon: Icon, title, description }, index) => (
              <div
                key={index}
                className='flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow'
              >
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Icon className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <Text level='h5' className='font-semibold text-gray-900 mb-1'>
                    {title}
                  </Text>
                  <Text level='p' className='text-gray-700 text-sm'>
                    {description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Included */}
        {course.features && course.features.length > 0 && (
          <div>
            <Text
              level='h4'
              className='font-semibold text-gray-800 mb-4 flex items-center gap-2'
            >
              <CheckCircleIcon className='w-5 h-5 text-green-600' />
              Everything included in your purchase
            </Text>
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='grid md:grid-cols-2 gap-3'>
                {course.features.map((feature, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 bg-white border border-gray-200 rounded-md px-4 py-3'
                  >
                    <CheckCircleIcon className='w-4 h-4 text-green-600 flex-shrink-0' />
                    <Text level='p' className='text-gray-700 font-medium'>
                      {feature}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* Student Details */}
        <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <UserIcon className='w-5 h-5 text-purple-600' />
            </div>
            <Text level='h4' className='font-semibold text-gray-800'>
              Your Account Details
            </Text>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center gap-3 bg-white rounded-lg p-3 border border-purple-200'>
              <div className='w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <Text level='p' className='text-gray-900 font-semibold'>
                  {user?.name}
                </Text>
                <Text level='p' className='text-gray-600 text-sm'>
                  {user?.email}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className='bg-gray-50 rounded-xl p-6 border'>
          <div className='flex items-center gap-2 mb-4'>
            <BanknotesIcon className='w-5 h-5 text-green-600' />
            <Text level='h4' className='font-semibold text-gray-800'>
              Order Summary
            </Text>
          </div>
          
          {/* Price breakdown logic */}
          {(course as any).originalPrice && (course as any).originalPrice !== course.price ? (
            <div className='space-y-3'>
              <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-600'>Original Price</span>
                <span className='line-through text-gray-500'>₹{(course as any).originalPrice?.toLocaleString('en-IN')}</span>
              </div>
              {(course as any).discountAmount > 0 && (
                <div className='flex justify-between items-center text-sm text-green-600'>
                  <span>Total Discount</span>
                  <span>-₹{(course as any).discountAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              {(course as any).appliedCoupon && (
                <div className='bg-green-50 rounded-lg p-3 border border-green-200'>
                  <div className='flex items-center gap-2 text-sm text-green-700'>
                    <CheckCircleIcon className='w-4 h-4' />
                    <span className='font-medium'>Coupon Applied: {(course as any).appliedCoupon.code}</span>
                  </div>
                  <Text level='p' className='text-xs text-green-600 mt-1'>
                    {(course as any).appliedCoupon.description}
                  </Text>
                </div>
              )}
              <hr className='border-gray-200' />
              <div className='flex justify-between items-center'>
                <Text level='h4' className='font-bold text-gray-900'>Total Amount</Text>
                <div className='text-right'>
                  <Text level='h4' className='font-bold text-gray-900'>₹{course.price?.toLocaleString('en-IN')}</Text>
                  {(course as any).savings > 0 && (
                    <Text level='p' className='text-sm text-green-600'>
                      You save ₹{(course as any).savings?.toLocaleString('en-IN')}!
                    </Text>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className='flex justify-between items-center'>
              <Text level='h4' className='font-bold text-gray-900'>Total Amount</Text>
              <Text level='h4' className='font-bold text-gray-900'>₹{course.price?.toLocaleString('en-IN')}</Text>
            </div>
          )}
        </div>

        {/* Error message */}
        {(error || sdkError) && (
          <div className='bg-red-50 border border-red-200 text-red-600 p-3 rounded'>
            {error || sdkError}
          </div>
        )}

        {/* Payment Button */}
        <Button
          text={isProcessing ? 'Processing...' : 'Proceed to Payment'}
          variant='PRIMARY'
          className={`w-full ${
            isProcessing || !isCashfreeLoaded ? 'opacity-50' : ''
          }`}
          onClick={handlePayment}
          active={!isProcessing && isCashfreeLoaded}
          isLoading={isProcessing}
        />

        {/* Loading message */}
        {!isCashfreeLoaded && (
          <Text level='p' className='text-sm text-gray-500 text-center'>
            Loading payment gateway...
          </Text>
        )}
        <div className='flex items-center justify-center gap-2 mt-3 text-gray-500'>
          <ShieldCheckIcon className='w-4 h-4' />
          <Text level='p' className='text-xs'>
            Secured by Cashfree • SSL Encrypted
          </Text>
        </div>
      </div>
    </Section>
  );
};

export default PaymentCard;
