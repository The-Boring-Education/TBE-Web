import {
  Button,
  LinkButton,
  LoginRedirectButton,
  MDXRenderer,
  PaymentCard,
  Section,
  SEO,
  Text,
} from '@tbe/components';
import { useGamifiedAction } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useAnalytics, useApi, usePaymentStatus, useUser } from '@tbe/hooks';
import type { CouponModel,SheetPageProps } from '@tbe/interface';
import { calculatePriceBreakdown, formatPrice, getDiscountDisplayInfo, getSavingsPercentage } from '@tbe/utils';
import { Fragment, useMemo, useRef, useState } from 'react';
import { FaCheckCircle, FaClock, FaLock, FaPercentage,FaPlay, FaStar, FaTags, FaUsers } from 'react-icons/fa';

interface SheetLandingPageProps {
  sheet: SheetPageProps['sheet'];
  meta: string;
  slug: string;
  seoMeta: SheetPageProps['seoMeta'];
}

const SheetLandingPage = ({ sheet, meta, slug, seoMeta }: SheetLandingPageProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponModel | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  //checking payemnt status for interview sheet
    const { isPurchased } = usePaymentStatus({
    userId: user?.id,
    productId: sheet?._id,
    isPremium: sheet?.isPremium,
    productType: 'INTERVIEW_SHEET',
  });

  const { makeRequest, loading } = useApi('interview-prep/enrollSheet');

  const previewQuestions = useMemo(() => (sheet?.questions || []).slice(0, 3), [sheet?.questions]);
  const lockedQuestions = useMemo(() => (sheet?.questions || []).slice(3), [sheet?.questions]);

  // Calculate pricing with discounts
  const priceBreakdown = useMemo(() => {
    if (!sheet?.isPremium || !sheet?.price || !sheet.name) {
      return null;
    }
    // Cast sheet to InterviewSheetModel for the utility functions
    const sheetModel = sheet as any;
    return calculatePriceBreakdown(sheetModel, appliedCoupon || undefined);
  }, [sheet, appliedCoupon]);

  const discountInfo = useMemo(() => {
    if (!sheet?.isPremium || !sheet.name) {
      return null;
    }
    // Cast sheet to InterviewSheetModel for the utility functions
    const sheetModel = sheet as any;
    return getDiscountDisplayInfo(sheetModel, appliedCoupon || undefined);
  }, [sheet, appliedCoupon]);

  //checking if the interview sheet is locked
  const isLocked = sheet?.isPremium && !sheet?.isEnrolled && isPurchased === false;
  //checking if the user can start now
  const canStartNow = sheet?.isEnrolled || (!sheet?.isPremium) || isPurchased;

  const enrollSheet = () => {
    makeRequest({
      method: 'POST',
      url: routes.api.enrollSheet,
      body: {
        userId: user?.id,
        sheetId: sheet._id,
      },
    })
      .then(async () => {
        trackEvent({
          action: 'INTERVIEW_SHEET_ENROLL',
          category: 'InterviewSheet',
          label: 'Interview Sheet Enrolled',
          value: {
            userId: user?.id,
            sheetId: sheet._id,
          },
        });

        await gamifiedAction.triggerGamifiedAction({
          gamificationAction: 'ENROLL_SHEET',
          analytics: {
            action: 'INTERVIEW_SHEET_ENROLL',
            category: 'InterviewSheet',
            label: 'Interview Sheet Enrolled',
          },
          customMessage: 'Interview sheet enrolled! Time to practice!',
          metadata: {
            sheetId: sheet._id,
            sheetName: sheet.name,
          },
        });

        setTimeout(() => {
          window.location.href = `${routes.interviewPrep}/${sheet.slug}`;
        }, 1500);
      })
      .catch((error) => error);
  };

  const handleShowPayment = () => {
    setShowPayment(true);
    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch(`${routes.api.base}${routes.api.validateCoupon}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          productId: sheet?._id,
          productType: 'INTERVIEW_SHEET',
        }),
      });

      const data = await response.json();

      if (data.status && data.data) {
        setAppliedCoupon(data.data);
        setCouponError('');
        trackEvent({
          action: 'COUPON_APPLIED' as any,
          category: 'Payment' as any,
          label: 'Coupon Applied Successfully' as any,
          value: { couponCode, sheetId: sheet?._id },
        });
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('Failed to validate coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleStartNow = () => {
    if (canStartNow) {
      // Navigate to first question
      window.location.href = `${routes.interviewPrep}/${sheet.slug}`;
    } else if (!isAuth) {
      // Handle login redirect
      return;
    } else if (!sheet?.isEnrolled && !sheet?.isPremium) {
      // Auto-enroll for free sheets
      enrollSheet();
    } else {
      // Show payment for premium sheets
      handleShowPayment();
    }
  };

  if (!sheet) return null;

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      
      {/* Hero Section - Full Width */}
      <Section className='bg-gradient-to-r from-blue-600 to-purple-700 text-white'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-center'>
            
            {/* Left: Content */}
            <div className='lg:col-span-2 space-y-4'>
              <div className='flex items-center gap-2 text-red-200'>
                <LinkButton
                  buttonProps={{
                    variant: 'GHOST',
                    text: '← Back to Explore',
                    className: 'bg-white text-red-600 hover:bg-gray-100 text-sm px-3 py-1 rounded border',
                  }}
                  href={routes.interviewPrepExplore}
                />
                <span>•</span>
                <Text level='p' className='text-sm uppercase tracking-wide'>{sheet.roadmap} Track</Text>
              </div>
              
              <Text className='text-3xl lg:text-4xl font-bold leading-tight' level='h1'>
                {sheet.name}
              </Text>
              
              <Text level='p' className='text-lg text-red-100'>
                {sheet.description}
              </Text>

              {/* Stats */}
              <div className='flex flex-wrap gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <FaPlay className='text-green-400' />
                  <span>{sheet.questions?.length || 0} Questions</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaClock className='text-yellow-400' />
                  <span>~{Math.ceil((sheet.questions?.length || 0) * 2)} minutes</span>
                </div>
                <div className='flex items-center gap-2'>
                  <FaUsers className='text-blue-400' />
                  <span>Beginner to Advanced</span>
                </div>
                {isPurchased ? (
                  <div className='flex items-center gap-2'>
                    <FaCheckCircle className='text-green-400' />
                    <span>Full Access Unlocked</span>
                  </div>
                ) : sheet.isPremium ? (
                  <div className='flex items-center gap-2'>
                    <FaStar className='text-yellow-400' />
                    <span>Premium Content</span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className='flex flex-wrap gap-3'>
                {!isAuth ? (
                  <LoginRedirectButton text='Login to Get Started' />
                ) : (
                  <Button
                    text={
                      loading ? 'Loading...' : 
                      isPurchased ? 'Start Practicing Now' :
                      canStartNow ? 'Start Practicing Now' :
                      !sheet?.isEnrolled && !sheet?.isPremium ? 'Enroll for Free' :
                      'Unlock Full Access'
                    }
                    variant={isPurchased ? 'SUCCESS' : 'PRIMARY'}
                    className={`px-4 py-2 text-base font-semibold ${
                      isPurchased 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                    onClick={handleStartNow}
                    isLoading={loading}
                  />
                )}
                
                {sheet?.isPremium && !isPurchased && (
                  <Text level='p' className='text-red-200 text-sm flex items-center'>
                    <FaLock className='mr-2' />
                    Premium - ₹{sheet.price} for lifetime access
                  </Text>
                )}
              </div>
            </div>

            {/* Right: Preview Card */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-lg shadow-lg p-4 text-gray-900'>
                <div className='aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3'>
                  <FaPlay className='text-3xl text-red-600' />
                </div>
                <Text level='p' className='font-semibold mb-2'>Preview this sheet</Text>
                <Text level='p' className='text-sm text-gray-600 mb-3'>
                  Get a quick overview of the questions and difficulty levels
                </Text>
                                      <Button
                        text='Preview Questions'
                        variant='SECONDARY'
                        className='w-full px-3 py-2 text-sm bg-red-500 text-white hover:bg-red-600'
                        onClick={() => document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' })}
                      />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Content Section */}
      <Section className='py-8'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              
              {/* About Section */}
              <div className='bg-white rounded-lg border p-5'>
                <Text className='text-xl font-bold mb-3' level='h2'>About This Sheet</Text>
                <div className='prose max-w-none'>
                  <MDXRenderer mdxSource={sheet.meta || meta || ''} />
                </div>
              </div>

              {/* What You'll Learn */}
              {sheet?.features && sheet.features.length > 0 && (
                <div className='bg-white rounded-lg border p-5'>
                  <Text className='text-xl font-bold mb-3' level='h3'>What You'll Learn</Text>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {sheet.features.map((feature, index) => (
                      <div key={index} className='flex items-start gap-3'>
                        <FaCheckCircle className='text-green-500 mt-1 flex-shrink-0' />
                        <Text level='p' className='text-gray-700'>{feature}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Questions Section */}
              <div id='preview-section' className='bg-white rounded-lg border p-5'>
                <Text className='text-xl font-bold mb-3' level='h3'>Preview Questions</Text>
                <Text level='p' className='text-gray-600 mb-4'>
                  Here are the first {previewQuestions.length} questions to give you a taste of what's inside:
                </Text>
                
                <div className='space-y-3'>
                  {previewQuestions.map((q, index) => (
                    <div key={q._id.toString()} className='border rounded-lg p-3 hover:shadow-md transition-shadow'>
                      <div className='flex items-start justify-between mb-2'>
                        <Text level='p' className='font-semibold text-gray-900'>
                          {index + 1}. {q.title}
                        </Text>
                        <span className='px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700'>
                          {q.frequency} Frequency
                        </span>
                      </div>
                      <Text level='p' className='text-gray-600 text-sm line-clamp-2'>
                        {q.question}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked Content Section */}
              {lockedQuestions.length > 0 && (
                <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border p-5'>
                  <div className='flex items-center gap-3 mb-3'>
                    <FaLock className='text-gray-500' />
                    <Text className='text-xl font-bold text-gray-700' level='h3'>
                      {lockedQuestions.length} More Questions Available
                    </Text>
                  </div>
                  
                  <Text level='p' className='text-gray-600 mb-4'>
                    {isPurchased 
                      ? 'You have full access to all questions! Continue practicing to master your skills.'
                      : isLocked 
                      ? 'Unlock premium access to view all questions with detailed solutions and explanations.'
                      : 'More questions are waiting for you after enrollment!'
                    }
                  </Text>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
                    {lockedQuestions.slice(0, 6).map((q, index) => (
                      <div key={q._id.toString()} className={`flex items-center gap-3 p-3 rounded border ${
                        isPurchased 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white opacity-60'
                      }`}>
                        {isPurchased ? (
                          <FaCheckCircle className='text-green-500 text-sm' />
                        ) : (
                          <FaLock className='text-gray-400 text-sm' />
                        )}
                        <Text level='p' className={`text-sm truncate ${
                          isPurchased ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {previewQuestions.length + index + 1}. {q.title}
                        </Text>
                      </div>
                    ))}
                  </div>

                  {isLocked && !isPurchased && (
                    <Button
                      text={`Unlock All ${sheet.questions?.length} Questions - ${priceBreakdown ? formatPrice(priceBreakdown.finalPrice) : formatPrice(sheet.price || 0)}`}
                      variant='PRIMARY'
                      onClick={handleShowPayment}
                      className='w-full px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600'
                    />
                  )}
                  {isPurchased && (
                    <div className='bg-green-50 border border-green-200 rounded-lg p-3 text-center'>
                      <div className='flex items-center justify-center gap-2 text-green-700 mb-2'>
                        <FaCheckCircle className='text-sm' />
                        <Text level='p' className='text-sm font-medium'>All Questions Unlocked</Text>
                      </div>
                      <Text level='p' className='text-xs text-green-600'>
                        You can now access all {sheet.questions?.length} questions and start practicing!
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-6 space-y-4'>
                
                {/* Action Card */}
                <div className='bg-white rounded-lg border shadow-lg p-5'>
                  <div className='text-center space-y-3'>
                    {sheet?.isPremium && !isPurchased && (
                      <div className='flex items-center justify-center gap-2 flex-wrap'>
                        <div className='bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium'>
                          Premium Content
                        </div>
                        {discountInfo?.showDiscountBadge && (
                          <div className='bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
                            <FaPercentage className='text-xs' />
                            {discountInfo.discountText}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      {isPurchased ? (
                        <div className='space-y-2'>
                          <Text level='p' className='text-2xl font-bold text-green-600'>Purchased</Text>
                          <Text level='p' className='text-sm text-gray-600'>Lifetime Access</Text>
                          <div className='bg-green-50 border border-green-200 rounded-lg p-3 mt-3'>
                            <div className='flex items-center gap-2 text-green-700'>
                              <FaCheckCircle className='text-sm' />
                              <Text level='p' className='text-sm font-medium'>Full Access Granted</Text>
                            </div>
                            <Text level='p' className='text-xs text-green-600 mt-1'>
                              You can access all {sheet.questions?.length || 0} questions and solutions
                            </Text>
                          </div>
                        </div>
                      ) : !sheet?.isPremium ? (
                        <Text level='p' className='text-2xl font-bold text-gray-900'>Free</Text>
                      ) : priceBreakdown ? (
                        <div className='space-y-2'>
                          {priceBreakdown.savings > 0 && (
                            <div className='flex items-center justify-center gap-2'>
                              <Text level='p' className='text-lg text-gray-500 line-through'>
                                {formatPrice(priceBreakdown.originalPrice)}
                              </Text>
                              <div className='bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium'>
                                {getSavingsPercentage(priceBreakdown.originalPrice, priceBreakdown.finalPrice)}% OFF
                              </div>
                            </div>
                          )}
                          <Text level='p' className='text-2xl font-bold text-gray-900'>
                            {formatPrice(priceBreakdown.finalPrice)}
                          </Text>
                          {priceBreakdown.savings > 0 && (
                            <Text level='p' className='text-sm text-green-600 font-medium'>
                              You save {formatPrice(priceBreakdown.savings)}!
                            </Text>
                          )}
                        </div>
                      ) : (
                        <Text level='p' className='text-2xl font-bold text-gray-900'>
                          {formatPrice(sheet.price || 0)}
                        </Text>
                      )}
                      {sheet?.isPremium && !isPurchased && (
                        <Text level='p' className='text-sm text-gray-600'>Lifetime Access</Text>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    {sheet?.isPremium && priceBreakdown && priceBreakdown.savings > 0 && (
                      <div className='bg-gray-50 rounded-lg p-3 text-left space-y-2'>
                        <Text level='p' className='text-sm font-semibold text-gray-700 mb-2'>Price Breakdown</Text>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>Original Price</span>
                          <span>{formatPrice(priceBreakdown.originalPrice)}</span>
                        </div>
                        {priceBreakdown.discountAmount > 0 && (
                          <div className='flex justify-between text-sm text-green-600'>
                            <span>Sheet Discount ({priceBreakdown.discountPercentage}%)</span>
                            <span>-{formatPrice(priceBreakdown.discountAmount)}</span>
                          </div>
                        )}
                        {priceBreakdown.couponDiscount > 0 && appliedCoupon && (
                          <div className='flex justify-between text-sm text-green-600'>
                            <span>Coupon ({appliedCoupon.code})</span>
                            <span>-{formatPrice(priceBreakdown.couponDiscount)}</span>
                          </div>
                        )}
                        <hr className='border-gray-200' />
                        <div className='flex justify-between text-sm font-semibold'>
                          <span>Final Price</span>
                          <span>{formatPrice(priceBreakdown.finalPrice)}</span>
                        </div>
                      </div>
                    )}

                    {/* Coupon Input - Only show if sheet is premium and not purchased */}
                    {sheet?.isPremium && !appliedCoupon && !isPurchased && (
                      <div className='bg-blue-50 rounded-lg p-3 text-center'>
                        <div className='flex items-center justify-center gap-2 mb-3'>
                          <FaTags className='text-blue-500 text-sm' />
                          <Text level='p' className='text-sm font-semibold text-blue-700'>Have a coupon?</Text>
                        </div>
                        <div className='space-y-3'>
                          <input
                            type='text'
                            placeholder='Enter coupon code'
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className='w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center'
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                          <Button
                            text={couponLoading ? 'Applying...' : 'Apply'}
                            variant='PRIMARY'
                            className='w-full px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600'
                            onClick={handleApplyCoupon}
                            isLoading={couponLoading}
                            disabled={!couponCode.trim()}
                          />
                        </div>
                        {couponError && (
                          <Text level='p' className='text-xs text-red-600 mt-2 text-center'>{couponError}</Text>
                        )}
                      </div>
                    )}

                    {/* Applied Coupon Display - Only show if sheet is premium and not purchased */}
                    {sheet?.isPremium && appliedCoupon && !isPurchased && (
                      <div className='bg-green-50 rounded-lg p-3 text-left'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <FaTags className='text-green-500 text-sm' />
                            <div>
                              <Text level='p' className='text-sm font-semibold text-green-700'>
                                {appliedCoupon.code} Applied
                              </Text>
                              <Text level='p' className='text-xs text-green-600'>
                                {appliedCoupon.description}
                              </Text>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className='text-xs text-red-500 hover:text-red-700 underline'
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {!isAuth ? (
                      <LoginRedirectButton text='Login to Get Started' />
                    ) : (
                      <Button
                        text={
                          loading ? 'Loading...' :
                          isPurchased ? 'Start Practicing Now' :
                          canStartNow ? 'Start Now' :
                          !sheet?.isEnrolled && !sheet?.isPremium ? 'Enroll Free' :
                          priceBreakdown ? `Purchase Access - ${formatPrice(priceBreakdown.finalPrice)}` :
                          'Purchase Access'
                        }
                        variant={isPurchased ? 'SUCCESS' : 'PRIMARY'}
                        className={`w-full px-4 py-2 text-sm font-semibold ${
                          isPurchased 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={handleStartNow}
                        isLoading={loading}
                      />
                    )}

                    <Text level='p' className='text-xs text-gray-500'>
                      ✓ Instant access ✓ Lifetime updates ✓ Mobile friendly
                    </Text>
                  </div>
                </div>

                {/* Quick Info */}
                <div className='bg-white rounded-lg border p-4'>
                  <Text level='p' className='font-semibold mb-3'>This sheet includes:</Text>
                  <div className='space-y-2 text-sm text-gray-600'>
                    <div className='flex items-center gap-3'>
                      <FaPlay className='text-red-500' />
                      <span>{sheet.questions?.length || 0} Interview Questions</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <FaCheckCircle className='text-green-500' />
                      <span>Detailed Solutions</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <FaClock className='text-yellow-500' />
                      <span>Progress Tracking</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <FaStar className='text-purple-500' />
                      <span>Bookmark Questions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Payment Modal */}
      {showPayment && (
        <div ref={paymentSectionRef} className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto'>
            <PaymentCard
              course={{
                ...sheet,
                price: priceBreakdown?.finalPrice || sheet.price || 0,
                // Pass additional discount info as custom properties
                ...(priceBreakdown && {
                  originalPrice: priceBreakdown.originalPrice,
                  discountAmount: priceBreakdown.totalDiscount,
                  savings: priceBreakdown.savings,
                }),
                ...(appliedCoupon && {
                  appliedCoupon: appliedCoupon._id || appliedCoupon,
                }),
              }}
              onClose={() => setShowPayment(false)}
              productType='INTERVIEW_SHEET'
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default SheetLandingPage;