import { useUser, useCashfreePayment } from '@/hooks';
import { Button, FlexContainer, Section, Text } from '@/components';
import type { PaymentCardProps } from '@/interfaces';
import { useState } from 'react';

const PaymentCard = ({ course, onClose }: PaymentCardProps) => {
  const { user } = useUser();
  const { isCashfreeLoaded, error: sdkError, launchPayment } = useCashfreePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const createPaymentOrder = async (): Promise<string> => {
    const response = await fetch('/api/v1/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.id,
        productId: course._id,
        productType: 'SHIKSHA',
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
        (successData) => {
          console.log('Payment success:', successData);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        (failureData) => {
          console.error('Payment failed:', failureData);
          setError('Payment failed. Please try again.');
          setIsProcessing(false);
        },
        () => {
          console.log('Checkout closed');
          setIsProcessing(false);
        }
      );
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <Section className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
      <FlexContainer className="justify-between items-center mb-4">
        <Text level="h3" className="heading-4">
          Complete Your Purchase
        </Text>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </FlexContainer>

      <Section className="space-y-4">

        {/* Course Details */}
        <div className="border-b pb-4">
          <Text level="h4" className="font-medium mb-2">
            Course Details
          </Text>
          <Text level="p" className="text-gray-600">
            {course.name}
          </Text>
        </div>

        {/* Price Details */}
        <div className="border-b pb-4">
          <Text level="h4" className="font-medium mb-2">
            Price Details
          </Text>
          <div className="flex justify-between">
            <Text level="p" className="text-gray-600">
              Course Price
            </Text>
            <Text level="p" className="font-medium">
              ₹{course.price}
            </Text>
          </div>
        </div>

        {/* Student Details */}
        <div className="border-b pb-4">
          <Text level="h4" className="font-medium mb-2">
            Student Details
          </Text>
          <div className="space-y-2">
            <Text level="p" className="text-gray-600">
              Name: {user?.name}
            </Text>
            <Text level="p" className="text-gray-600">
              Email: {user?.email}
            </Text>
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
      </Section>
    </Section>
  );
};

export default PaymentCard;
