import { BanknotesIcon, BookOpenIcon, ShieldCheckIcon, UserIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Button, FlexContainer, Section, Text } from '@/components';
import { routes } from '@/constant';
import { useCashfreePayment,useUser } from '@/hooks';
import type { PaymentCardProps } from '@/interfaces';

const PaymentCard = ({ course, onClose, productType }: PaymentCardProps) => {
  const { user } = useUser();
  const { isCashfreeLoaded, error: sdkError, launchPayment } = useCashfreePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const createPaymentOrder = async (): Promise<string> => {
    const response = await fetch(`${routes.api.base}${routes.api.createOrder}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id,
        productId: course._id,
        productType,
        amount: course.price,
        customerName: user?.name,
        customerEmail: user?.email,
      }),
    });

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
      await launchPayment(paymentSessionId,
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
    <Section className="mt-8 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <FlexContainer className="justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-blue-600" />
            </div>
            <Text level="h3" className="heading-4 text-gray-800">
              Complete Your Purchase
            </Text>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </FlexContainer>
      </div>

      <div className="p-2 space-y-6">
        {/* Course Details */}
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center gap-3 mb-3">
            <BookOpenIcon className="w-5 h-5 text-blue-600" />
            <Text level="h4" className="font-semibold text-gray-800">
              Course Details
            </Text>
          </div>
          <Text level="p" className="text-gray-700 font-medium">
            {course.name}
          </Text>
        </div>

        {/* Course Features */}
        <div>
          <Text level="h4" className="font-semibold text-gray-800 mb-3">
            What's Included
          </Text>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex flex-wrap gap-2">
            {course.features?.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                <p className="text-gray-700 font-medium whitespace-nowrap">
                  {feature}
                </p>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Price Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <BanknotesIcon className="w-5 h-5 text-green-600" />
            <Text level="h4" className="font-semibold text-gray-800">
              Price Details
            </Text>
          </div>
          <div className="flex justify-between items-center">
            <Text level="p" className="text-gray-600">
              Course Price
            </Text>
            <div className="text-right">
              <Text level="p" className="text-2xl font-bold text-green-600">
                ₹{course.price}
              </Text>
              <Text level="p" className="text-sm text-gray-500">
                One-time payment
              </Text>
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <UserIcon className="w-5 h-5 text-purple-600" />
            <Text level="h4" className="font-semibold text-gray-800">
              Student Details
            </Text>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Text level="p" className="text-gray-600 font-medium">
                Name:
              </Text>
              <Text level="p" className="text-gray-800">
                {user?.name}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text level="p" className="text-gray-600 font-medium">
                Email:
              </Text>
              <Text level="p" className="text-gray-800">
                {user?.email}
              </Text>
            </div>
          </div>
        </div>

        {/* Error message */}
        {(error || sdkError) && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            {error || sdkError}
          </div>
        )}

        {/* Payment Button */}
        <Button
          text={isProcessing ? 'Processing...' : 'Proceed to Payment'}
          variant="PRIMARY"
          className={`w-full ${isProcessing || !isCashfreeLoaded ? 'opacity-50' : ''}`}
          onClick={handlePayment}
          active={!isProcessing && isCashfreeLoaded}
          isLoading={isProcessing}
        />

        {/* Loading message */}
        {!isCashfreeLoaded && (
          <Text level="p" className="text-sm text-gray-500 text-center">
            Loading payment gateway...
          </Text>
        )}
        <div className="flex items-center justify-center gap-2 mt-3 text-gray-500">
            <ShieldCheckIcon className="w-4 h-4" />
            <Text level="p" className="text-xs">
              Secured by Cashfree • SSL Encrypted
            </Text>
          </div>
      </div>
    </Section>
  );
};

export default PaymentCard;
