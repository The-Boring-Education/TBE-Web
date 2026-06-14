import {
  BanknotesIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Button, FlexContainer, Text } from "@tbe/components";
import { routes } from "@tbe/constants";
import { getProductConfig } from "@tbe/constants";
import { useCashfreePayment, useUser } from "@tbe/hooks";
import type { BaseProductProps, PaymentCardProps } from "@tbe/interface";
import React, { useState } from "react";

const PaymentCard = ({ course, onClose, productType }: PaymentCardProps) => {
  const { user } = useUser();
  const {
    isCashfreeLoaded,
    error: sdkError,
    launchPayment,
  } = useCashfreePayment();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get product configuration based on product type
  const productConfig = getProductConfig(productType);
  const productName = productConfig.name;
  const ProductIcon = productConfig.icon;
  const reasonsToBuy = productConfig.reasonsToBuy;

  const createPaymentOrder = async (): Promise<{
    paymentSessionId: string;
    orderId: string;
  }> => {
    const response = await fetch(
      `${routes.api.base}${routes.api.createOrder}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          productId: course._id,
          productType,
          customerName: user?.name,
          customerEmail: user?.email,
          ...((course as BaseProductProps).appliedCoupon && {
            couponCode: (course as BaseProductProps).appliedCoupon!.code,
          }),
        }),
      },
    );

    const data = await response.json();

    if (!data.status || !data.data?.paymentSessionId || !data.data?.orderId) {
      throw new Error(data.message || "Failed to create order");
    }

    return {
      paymentSessionId: data.data.paymentSessionId as string,
      orderId: data.data.orderId as string,
    };
  };

  const handlePayment = async () => {
    if (!isCashfreeLoaded) {
      setError("Payment gateway is not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { paymentSessionId, orderId } = await createPaymentOrder();
      const returnUrl = `${window.location.origin}${routes.paymentStatus}?order_id=${encodeURIComponent(orderId)}&next=${encodeURIComponent(routes.user.dashboard)}`;
      await launchPayment(
        paymentSessionId,
        (_successData) => {
          window.location.assign(returnUrl);
        },
        (_failureData) => {
          setError("Payment failed. Please try again.");
          setIsProcessing(false);
        },
        () => {
          setIsProcessing(false);
        },
        returnUrl,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 border-b border-gray-200">
          <FlexContainer className="justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ProductIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <Text
                level="h3"
                className="text-lg sm:text-xl font-bold text-gray-800"
              >
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

        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Product Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg self-center sm:self-start">
                <ProductIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Text
                  level="h3"
                  className="font-bold text-gray-900 mb-2 text-base sm:text-lg"
                >
                  {course.name}
                </Text>
                <Text
                  level="p"
                  className="text-gray-700 leading-relaxed text-sm"
                >
                  {course.description ||
                    `Premium ${productName.toLowerCase()} designed to accelerate your learning and career growth.`}
                </Text>
              </div>
            </div>
          </div>

          {/* Why This Is Worth It */}
          <div>
            <Text
              level="h3"
              className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base sm:text-lg"
            >
              <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              Why thousands choose our premium {productName.toLowerCase()}s
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reasonsToBuy.map(({ icon: Icon, title, description }, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <Text
                      level="h5"
                      className="font-semibold text-gray-900 mb-1 text-sm"
                    >
                      {title}
                    </Text>
                    <Text level="p" className="text-gray-700 text-xs">
                      {description}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's Included */}
          {(course.features && course.features.length > 0) ||
          (productConfig.defaultFeatures &&
            productConfig.defaultFeatures.length > 0) ? (
            <div>
              <Text
                level="h4"
                className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base"
              >
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Everything included in your purchase
              </Text>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(course.features && course.features.length > 0
                    ? course.features
                    : productConfig.defaultFeatures || []
                  ).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <Text
                        level="p"
                        className="text-gray-700 font-medium text-sm"
                      >
                        {feature}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Student Details */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <UserIcon className="w-4 h-4 text-purple-600" />
              </div>
              <Text level="h4" className="font-semibold text-gray-800 text-sm">
                Your Account Details
              </Text>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-purple-200">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Text
                    level="p"
                    className="text-gray-900 font-semibold text-sm"
                  >
                    {user?.name}
                  </Text>
                  <Text level="p" className="text-gray-600 text-xs">
                    {user?.email}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-xl p-3 border">
            <div className="flex items-center gap-2 mb-3">
              <BanknotesIcon className="w-4 h-4 text-green-600" />
              <Text level="h4" className="font-semibold text-gray-800 text-sm">
                Order Summary
              </Text>
            </div>

            {/* Price breakdown logic */}
            {(course as BaseProductProps).originalPrice &&
            (course as BaseProductProps).originalPrice !== course.price ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Original Price</span>
                  <span className="line-through text-gray-500">
                    ₹
                    {(course as BaseProductProps).originalPrice?.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                {((course as BaseProductProps).discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Total Discount</span>
                    <span>
                      -₹
                      {(
                        course as BaseProductProps
                      ).discountAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {(course as BaseProductProps).appliedCoupon && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="font-medium">
                        Coupon Applied:{" "}
                        {(course as BaseProductProps).appliedCoupon!.code}
                      </span>
                    </div>
                    <Text level="p" className="text-xs text-green-600 mt-1">
                      {(course as BaseProductProps).appliedCoupon!.description}
                    </Text>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <Text level="h4" className="font-bold text-gray-900">
                    Total Amount
                  </Text>
                  <div className="text-right">
                    <Text level="h4" className="font-bold text-gray-900">
                      ₹{course.price?.toLocaleString("en-IN")}
                    </Text>
                    {((course as BaseProductProps).savings ?? 0) > 0 && (
                      <Text level="p" className="text-sm text-green-600">
                        You save ₹
                        {(course as BaseProductProps).savings?.toLocaleString(
                          "en-IN",
                        )}
                        !
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <Text level="h4" className="font-bold text-gray-900">
                  Total Amount
                </Text>
                <Text level="h4" className="font-bold text-gray-900">
                  ₹{course.price?.toLocaleString("en-IN")}
                </Text>
              </div>
            )}
          </div>

          {/* Error message */}
          {(error || sdkError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error || sdkError}
            </div>
          )}

          {/* Payment Button */}
          <Button
            text={isProcessing ? "Processing..." : "Proceed to Payment"}
            variant="PRIMARY"
            className={`w-full text-sm py-3 ${
              isProcessing || !isCashfreeLoaded ? "opacity-50" : ""
            }`}
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
            <Text level="p" className="text-xs sm:text-sm">
              Secured by Cashfree • SSL Encrypted
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
