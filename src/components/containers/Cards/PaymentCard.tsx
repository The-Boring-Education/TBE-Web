import { useUser } from '@/hooks';
import { Button, FlexContainer, Section, Text } from '@/components';
import type { PaymentCardProps } from '@/interfaces';
import { useState } from 'react';

const PaymentCard = ({ course, onClose }: PaymentCardProps) => {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    console.log('Proceed to payment clicked');
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
        <div className="border-b pb-4">
          <Text level="h4" className="font-medium mb-2">
            Course Details
          </Text>
          <Text level="p" className="text-gray-600">
            {course.name}
          </Text>
        </div>

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

        <Button
          text={isProcessing ? 'Processing...' : 'Proceed to Payment'}
          variant="PRIMARY"
          className={`w-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handlePayment}
        />
      </Section>
    </Section>
  );
};

export default PaymentCard;
