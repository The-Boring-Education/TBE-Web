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
import type { PaymentCardProps } from "@tbe/interface";
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
    paymentLink?: string;
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
          ...((course as any).appliedCoupon && {
            couponCode: (course as any).appliedCoupon.code,
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
      paymentLink:
        typeof data.data.paymentLink === "string"
          ? data.data.paymentLink
          : undefined,
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
      const { paymentSessionId, orderId, paymentLink } =
        await createPaymentOrder();
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
        paymentLink,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#121216] rounded-xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-white/[0.04] dark:to-white/[0.02] px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <FlexContainer className="justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <ProductIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-primary" />
              </div>
              <Text
                level="h3"
                className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white"
              >
                Complete Your Purchase
              </Text>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </FlexContainer>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Product Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-white/[0.04] dark:to-white/[0.02] rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-primary/20 rounded-lg self-center sm:self-start">
                <ProductIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Text
                  level="h3"
                  className="font-bold text-gray-900 dark:text-white mb-2 text-base sm:text-lg"
                >
                  {course.name}
                </Text>
                <Text
                  level="p"
                  className="text-gray-700 dark:text-zinc-300 leading-relaxed text-sm"
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
              className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-base sm:text-lg"
            >
              <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              Why thousands choose our premium {productName.toLowerCase()}s
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reasonsToBuy.map(({ icon: Icon, title, description }, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-3 bg-green-50 dark:bg-emerald-950/20 border border-green-200 dark:border-emerald-500/20 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-1.5 bg-green-100 dark:bg-emerald-500/20 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <Text
                      level="h5"
                      className="font-semibold text-gray-900 dark:text-white mb-1 text-sm"
                    >
                      {title}
                    </Text>
                    <Text
                      level="p"
                      className="text-gray-700 dark:text-zinc-300 text-xs"
                    >
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
                className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2 text-sm sm:text-base"
              >
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-emerald-400" />
                Everything included in your purchase
              </Text>
              <div className="bg-gray-50 dark:bg-white/[0.02] rounded-lg p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(course.features && course.features.length > 0
                    ? course.features
                    : productConfig.defaultFeatures || []
                  ).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-md px-3 py-2"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-emerald-400 flex-shrink-0" />
                      <Text
                        level="p"
                        className="text-gray-700 dark:text-zinc-200 font-medium text-sm"
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
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <Text
                level="h4"
                className="font-semibold text-gray-800 dark:text-white text-sm"
              >
                Your Account Details
              </Text>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] rounded-lg p-2 border border-purple-200 dark:border-purple-500/20">
                <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Text
                    level="p"
                    className="text-gray-900 dark:text-white font-semibold text-sm"
                  >
                    {user?.name}
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-600 dark:text-zinc-400 text-xs"
                  >
                    {user?.email}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <BanknotesIcon className="w-4 h-4 text-green-600 dark:text-emerald-400" />
              <Text
                level="h4"
                className="font-semibold text-gray-800 dark:text-white text-sm"
              >
                Order Summary
              </Text>
            </div>

            {/* Price breakdown logic */}
            {(course as any).originalPrice &&
            (course as any).originalPrice !== course.price ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-zinc-400">
                    Original Price
                  </span>
                  <span className="line-through text-gray-500 dark:text-zinc-500">
                    ₹{(course as any).originalPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
                {(course as any).discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 dark:text-emerald-400">
                    <span>Total Discount</span>
                    <span>
                      -₹
                      {(course as any).discountAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {(course as any).appliedCoupon && (
                  <div className="bg-green-50 dark:bg-emerald-950/20 rounded-lg p-3 border border-green-200 dark:border-emerald-500/20">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-emerald-300">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="font-medium">
                        Coupon Applied: {(course as any).appliedCoupon.code}
                      </span>
                    </div>
                    <Text
                      level="p"
                      className="text-xs text-green-600 dark:text-emerald-400 mt-1"
                    >
                      {(course as any).appliedCoupon.description}
                    </Text>
                  </div>
                )}
                <hr className="border-gray-200 dark:border-white/10" />
                <div className="flex justify-between items-center">
                  <Text
                    level="h4"
                    className="font-bold text-gray-900 dark:text-white"
                  >
                    Total Amount
                  </Text>
                  <div className="text-right">
                    <Text
                      level="h4"
                      className="font-bold text-gray-900 dark:text-white"
                    >
                      ₹{course.price?.toLocaleString("en-IN")}
                    </Text>
                    {(course as any).savings > 0 && (
                      <Text
                        level="p"
                        className="text-sm text-green-600 dark:text-emerald-400"
                      >
                        You save ₹
                        {(course as any).savings?.toLocaleString("en-IN")}!
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <Text
                  level="h4"
                  className="font-bold text-gray-900 dark:text-white"
                >
                  Total Amount
                </Text>
                <Text
                  level="h4"
                  className="font-bold text-gray-900 dark:text-white"
                >
                  ₹{course.price?.toLocaleString("en-IN")}
                </Text>
              </div>
            )}
          </div>

          {/* Error message */}
          {(error || sdkError) && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded">
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
            <Text
              level="p"
              className="text-sm text-gray-500 dark:text-zinc-400 text-center"
            >
              Loading payment gateway...
            </Text>
          )}
          <div className="flex items-center justify-center gap-2 mt-3 text-gray-500 dark:text-zinc-400">
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
