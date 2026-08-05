import {
  Button,
  LinkButton,
  LoginRedirectButton,
  MDXRenderer,
  PaymentCard,
  Section,
  SEO,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useGamifiedAction } from "@tbe/gamification";
import { useAnalytics, useApi, usePaymentAccess, useUser } from "@tbe/hooks";
import type { CouponModel, SheetPageProps } from "@tbe/interface";
import {
  calculatePriceBreakdown,
  formatPrice,
  getDiscountDisplayInfo,
  getSavingsPercentage,
} from "@tbe/utils";
import { Fragment, useMemo, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaLock,
  FaPercentage,
  FaPlay,
  FaStar,
  FaTags,
  FaUsers,
} from "react-icons/fa";

interface SheetLandingPageProps {
  sheet: SheetPageProps["sheet"];
  meta: string;
  slug: string;
  seoMeta: SheetPageProps["seoMeta"];
}

const SheetLandingPage = ({
  sheet,
  meta,
  slug,
  seoMeta,
}: SheetLandingPageProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponModel | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();

  // Universal payment access hook - handles all payment status and locked logic
  const { isLocked, isPurchased, hasAccess } = usePaymentAccess({
    productId: sheet?._id,
    productType: "INTERVIEW_SHEET",
    isPremium: sheet?.isPremium,
    isEnrolled: sheet?.isEnrolled,
  });

  const { makeRequest, loading } = useApi("interview-prep/enrollSheet");

  const previewQuestions = useMemo(
    () => (sheet?.questions || []).slice(0, 3),
    [sheet?.questions],
  );
  const lockedQuestions = useMemo(
    () => (sheet?.questions || []).slice(3),
    [sheet?.questions],
  );

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

  // User can start if they have access
  const canStartNow = hasAccess;

  const enrollSheet = () => {
    makeRequest({
      method: "POST",
      url: routes.api.enrollSheet,
      body: {
        userId: user?.id,
        sheetId: sheet._id,
      },
    })
      .then(async () => {
        trackEvent({
          action: "INTERVIEW_SHEET_ENROLL",
          category: "InterviewSheet",
          label: "Interview Sheet Enrolled",
          value: {
            userId: user?.id,
            sheetId: sheet._id,
          },
        });

        await gamifiedAction.triggerGamifiedAction({
          gamificationAction: "ENROLL_SHEET",
          analytics: {
            action: "INTERVIEW_SHEET_ENROLL",
            category: "InterviewSheet",
            label: "Interview Sheet Enrolled",
          },
          customMessage: "Interview sheet enrolled! Time to practice!",
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
      paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await fetch(
        `${routes.api.base}${routes.api.validateCoupon}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: couponCode.toUpperCase(),
            productId: sheet?._id,
            productType: "INTERVIEW_SHEET",
          }),
        },
      );

      const data = await response.json();

      if (data.status && data.data) {
        setAppliedCoupon(data.data);
        setCouponError("");
        trackEvent({
          action: "COUPON_APPLIED" as any,
          category: "Payment" as any,
          label: "Coupon Applied Successfully" as any,
          value: { couponCode, sheetId: sheet?._id },
        });
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
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
      <Section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Breadcrumb / Navigation */}
              <div className="flex items-center gap-3 flex-wrap">
                <LinkButton
                  buttonProps={{
                    variant: "GHOST",
                    text: "← Back to Explore",
                    className:
                      "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-sm px-4 py-2 rounded-full border border-white/20 transition-all duration-200",
                  }}
                  href={routes.interviewPrepExplore}
                />
                <span className="text-white/40">•</span>
                <span className="bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/20">
                  {sheet.roadmap} Track
                </span>
              </div>

              {/* Title */}
              <Text
                className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight"
                level="h1"
              >
                {sheet.name}
              </Text>

              {/* Description */}
              <Text
                level="p"
                className="text-lg lg:text-xl text-blue-100 max-w-2xl leading-relaxed"
              >
                {sheet.description}
              </Text>

              {/* Stats Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <FaPlay className="text-green-400 text-sm" />
                  <span className="text-sm font-medium">
                    {sheet.questions?.length || 0} Questions
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <FaClock className="text-yellow-400 text-sm" />
                  <span className="text-sm font-medium">
                    ~{Math.ceil((sheet.questions?.length || 0) * 2)} min
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <FaUsers className="text-blue-300 text-sm" />
                  <span className="text-sm font-medium">All Levels</span>
                </div>
                {isPurchased ? (
                  <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30">
                    <FaCheckCircle className="text-green-400 text-sm" />
                    <span className="text-sm font-medium text-green-200">
                      Full Access
                    </span>
                  </div>
                ) : sheet.isPremium ? (
                  <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-medium text-yellow-200">
                      Premium
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {!isAuth ? (
                  <LoginRedirectButton text="Login to Get Started" />
                ) : (
                  <Button
                    text={
                      loading
                        ? "Loading..."
                        : isPurchased
                          ? "Start Practicing Now →"
                          : canStartNow
                            ? "Start Practicing Now →"
                            : !sheet?.isEnrolled && !sheet?.isPremium
                              ? "Enroll for Free →"
                              : "Unlock Full Access →"
                    }
                    variant={isPurchased ? "SUCCESS" : "PRIMARY"}
                    className={`px-8 py-3.5 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                      isPurchased
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                        : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
                    }`}
                    onClick={handleStartNow}
                    isLoading={loading}
                  />
                )}

                {sheet?.isPremium && !isPurchased && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <FaLock className="text-white/70 text-sm" />
                    <Text
                      level="p"
                      className="text-white/90 text-sm font-medium"
                    >
                      ₹{sheet.price} · Lifetime Access
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Preview Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-900 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                    <FaPlay className="text-2xl text-white ml-1" />
                  </div>
                </div>
                <Text level="p" className="font-bold text-lg mb-2">
                  Preview this sheet
                </Text>
                <Text
                  level="p"
                  className="text-sm text-gray-600 mb-4 leading-relaxed"
                >
                  Get a quick overview of the questions and difficulty levels
                  before you start
                </Text>
                <Button
                  text="Preview Questions ↓"
                  variant="SECONDARY"
                  className="w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() =>
                    document
                      .getElementById("preview-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Content Section */}
      <Section className="py-12 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📖</span>
                  </div>
                  <Text className="text-2xl font-bold text-gray-900" level="h2">
                    About This Sheet
                  </Text>
                </div>
                <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-800">
                  <MDXRenderer mdxSource={sheet.meta || meta || ""} />
                </div>
              </div>

              {/* What You'll Learn */}
              {sheet?.features && sheet.features.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🎯</span>
                    </div>
                    <Text
                      className="text-2xl font-bold text-gray-900"
                      level="h3"
                    >
                      What You'll Learn
                    </Text>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sheet.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100"
                      >
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCheckCircle className="text-green-600 text-xs" />
                        </div>
                        <Text level="p" className="text-gray-700 font-medium">
                          {feature}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Questions Section */}
              <div
                id="preview-section"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FaPlay className="text-white text-sm" />
                  </div>
                  <Text className="text-2xl font-bold text-gray-900" level="h3">
                    Preview Questions
                  </Text>
                </div>
                <Text level="p" className="text-gray-600 mb-6 ml-13">
                  Here are the first {previewQuestions.length} questions to give
                  you a taste of what's inside:
                </Text>

                <div className="space-y-4">
                  {previewQuestions.map((q, index) => (
                    <div
                      key={q._id.toString()}
                      className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                            <span className="text-sm font-bold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1" title={q.title}>
                            <Text
                              level="p"
                              className="font-semibold text-gray-900 line-clamp-2 text-base group-hover:text-blue-700 transition-colors"
                            >
                              {q.title}
                            </Text>
                          </div>
                        </div>
                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200">
                            <FaStar className="text-red-500 text-[10px]" />
                            {q.frequency}
                          </span>
                        </div>
                      </div>
                      <Text
                        level="p"
                        className="text-gray-600 text-sm line-clamp-2 leading-relaxed ml-12"
                      >
                        {q.question}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked Content Section */}
              {lockedQuestions.length > 0 && (
                <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 rounded-2xl border border-gray-200 p-6 relative overflow-hidden">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-1/2 translate-y-1/2" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isPurchased
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        {isPurchased ? (
                          <FaCheckCircle className="text-white text-lg" />
                        ) : (
                          <FaLock className="text-white text-lg" />
                        )}
                      </div>
                      <div>
                        <Text
                          className="text-2xl font-bold text-gray-800"
                          level="h3"
                        >
                          {lockedQuestions.length} More Questions
                        </Text>
                        <Text level="p" className="text-gray-500 text-sm">
                          {isPurchased
                            ? "All unlocked and ready"
                            : "Waiting to be discovered"}
                        </Text>
                      </div>
                    </div>

                    <Text
                      level="p"
                      className="text-gray-600 mb-6 leading-relaxed"
                    >
                      {isPurchased
                        ? "You have full access to all questions! Continue practicing to master your skills."
                        : isLocked
                          ? "Unlock premium access to view all questions with detailed solutions and explanations."
                          : "More questions are waiting for you after enrollment!"}
                    </Text>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {lockedQuestions.slice(0, 6).map((q, index) => (
                        <div
                          key={q._id.toString()}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                            isPurchased
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md"
                              : "bg-white/60 border-gray-200 backdrop-blur-sm"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isPurchased ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {isPurchased ? (
                              <FaCheckCircle className="text-green-600 text-sm" />
                            ) : (
                              <FaLock className="text-gray-400 text-xs" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Text
                              level="p"
                              className={`text-sm font-medium truncate ${
                                isPurchased ? "text-green-800" : "text-gray-500"
                              }`}
                            >
                              {previewQuestions.length + index + 1}. {q.title}
                            </Text>
                          </div>
                          {/* Tag pill for frequency */}
                          {isPurchased && (
                            <span className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              {q.frequency}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {lockedQuestions.length > 6 && (
                      <Text
                        level="p"
                        className="text-center text-gray-500 text-sm mb-6"
                      >
                        + {lockedQuestions.length - 6} more questions...
                      </Text>
                    )}

                    {isLocked && !isPurchased && (
                      <Button
                        text={`Unlock All ${sheet.questions?.length} Questions · ${priceBreakdown ? formatPrice(priceBreakdown.finalPrice) : formatPrice(sheet.price || 0)}`}
                        variant="PRIMARY"
                        onClick={handleShowPayment}
                        className="w-full px-6 py-4 text-base font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      />
                    )}
                    {isPurchased && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FaCheckCircle className="text-green-600" />
                          </div>
                        </div>
                        <Text
                          level="p"
                          className="text-base font-semibold text-green-800 mb-1"
                        >
                          All Questions Unlocked
                        </Text>
                        <Text level="p" className="text-sm text-green-600">
                          You can now access all {sheet.questions?.length}{" "}
                          questions and start practicing!
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-5">
                {/* Action Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 overflow-hidden relative">
                  {/* Decorative gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

                  <div className="text-center space-y-4">
                    {sheet?.isPremium && !isPurchased && (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                          ⭐ Premium Content
                        </div>
                        {discountInfo?.showDiscountBadge && (
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                            <FaPercentage className="text-xs" />
                            {discountInfo.discountText}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      {isPurchased ? (
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                            <FaCheckCircle className="text-3xl text-green-600" />
                          </div>
                          <Text
                            level="p"
                            className="text-2xl font-bold text-green-600"
                          >
                            Purchased
                          </Text>
                          <Text level="p" className="text-sm text-gray-600">
                            Lifetime Access
                          </Text>
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mt-3">
                            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                              <FaCheckCircle className="text-sm" />
                              <Text level="p" className="text-sm font-semibold">
                                Full Access Granted
                              </Text>
                            </div>
                            <Text level="p" className="text-xs text-green-600">
                              You can access all {sheet.questions?.length || 0}{" "}
                              questions and solutions
                            </Text>
                          </div>
                        </div>
                      ) : !sheet?.isPremium ? (
                        <div className="space-y-2">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                            <FaPlay className="text-2xl text-blue-600" />
                          </div>
                          <Text
                            level="p"
                            className="text-3xl font-bold text-gray-900"
                          >
                            Free
                          </Text>
                          <Text level="p" className="text-sm text-gray-500">
                            No payment required
                          </Text>
                        </div>
                      ) : priceBreakdown ? (
                        <div className="space-y-3">
                          {priceBreakdown.savings > 0 && (
                            <div className="flex items-center justify-center gap-3">
                              <Text
                                level="p"
                                className="text-lg text-gray-400 line-through"
                              >
                                {formatPrice(priceBreakdown.originalPrice)}
                              </Text>
                              <div className="bg-gradient-to-r from-red-100 to-rose-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                                {getSavingsPercentage(
                                  priceBreakdown.originalPrice,
                                  priceBreakdown.finalPrice,
                                )}
                                % OFF
                              </div>
                            </div>
                          )}
                          <Text
                            level="p"
                            className="text-4xl font-bold text-gray-900"
                          >
                            {formatPrice(priceBreakdown.finalPrice)}
                          </Text>
                          {priceBreakdown.savings > 0 && (
                            <Text
                              level="p"
                              className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full inline-block"
                            >
                              🎉 You save {formatPrice(priceBreakdown.savings)}!
                            </Text>
                          )}
                        </div>
                      ) : (
                        <Text
                          level="p"
                          className="text-4xl font-bold text-gray-900"
                        >
                          {formatPrice(sheet.price || 0)}
                        </Text>
                      )}
                      {sheet?.isPremium && !isPurchased && (
                        <Text level="p" className="text-sm text-gray-500 mt-2">
                          One-time payment · Lifetime Access
                        </Text>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    {sheet?.isPremium &&
                      priceBreakdown &&
                      priceBreakdown.savings > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 text-left space-y-2 border border-gray-100">
                          <Text
                            level="p"
                            className="text-sm font-bold text-gray-700 mb-3"
                          >
                            💰 Price Breakdown
                          </Text>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Original Price
                            </span>
                            <span className="font-medium">
                              {formatPrice(priceBreakdown.originalPrice)}
                            </span>
                          </div>
                          {priceBreakdown.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>
                                Sheet Discount (
                                {priceBreakdown.discountPercentage}%)
                              </span>
                              <span className="font-medium">
                                -{formatPrice(priceBreakdown.discountAmount)}
                              </span>
                            </div>
                          )}
                          {priceBreakdown.couponDiscount > 0 &&
                            appliedCoupon && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Coupon ({appliedCoupon.code})</span>
                                <span className="font-medium">
                                  -{formatPrice(priceBreakdown.couponDiscount)}
                                </span>
                              </div>
                            )}
                          <hr className="border-gray-200 my-2" />
                          <div className="flex justify-between text-sm font-bold">
                            <span>Final Price</span>
                            <span className="text-green-600">
                              {formatPrice(priceBreakdown.finalPrice)}
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Coupon Input - Only show if sheet is premium and not purchased */}
                    {sheet?.isPremium && !appliedCoupon && !isPurchased && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <FaTags className="text-blue-500 text-sm" />
                          <Text
                            level="p"
                            className="text-sm font-bold text-blue-700"
                          >
                            Have a coupon?
                          </Text>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            className="w-full px-4 py-3 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium bg-white"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyCoupon()
                            }
                          />
                          <Button
                            text={
                              couponLoading ? "Applying..." : "Apply Coupon"
                            }
                            variant="PRIMARY"
                            className="w-full px-4 py-3 text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-md"
                            onClick={handleApplyCoupon}
                            isLoading={couponLoading}
                            disabled={!couponCode.trim()}
                          />
                        </div>
                        {couponError && (
                          <Text
                            level="p"
                            className="text-xs text-red-600 mt-2 text-center font-medium"
                          >
                            {couponError}
                          </Text>
                        )}
                      </div>
                    )}

                    {/* Applied Coupon Display - Only show if sheet is premium and not purchased */}
                    {sheet?.isPremium && appliedCoupon && !isPurchased && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-left border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <FaTags className="text-green-600 text-sm" />
                            </div>
                            <div>
                              <Text
                                level="p"
                                className="text-sm font-bold text-green-700"
                              >
                                {appliedCoupon.code} Applied ✓
                              </Text>
                              <Text
                                level="p"
                                className="text-xs text-green-600"
                              >
                                {appliedCoupon.description}
                              </Text>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Main CTA Button */}
                    {!isAuth ? (
                      <LoginRedirectButton text="Login to Get Started" />
                    ) : (
                      <Button
                        text={
                          loading
                            ? "Loading..."
                            : isPurchased
                              ? "Start Practicing Now →"
                              : canStartNow
                                ? "Start Now →"
                                : !sheet?.isEnrolled && !sheet?.isPremium
                                  ? "Enroll Free →"
                                  : priceBreakdown
                                    ? `Get Access · ${formatPrice(priceBreakdown.finalPrice)}`
                                    : "Get Access"
                        }
                        variant={isPurchased ? "SUCCESS" : "PRIMARY"}
                        className={`w-full px-6 py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                          isPurchased
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                            : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
                        }`}
                        onClick={handleStartNow}
                        isLoading={loading}
                      />
                    )}

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-gray-500 pt-2">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        ✓ Instant access
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        ✓ Lifetime updates
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        ✓ Mobile friendly
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <Text level="p" className="font-bold text-gray-900 mb-4">
                    📚 This sheet includes:
                  </Text>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <FaPlay className="text-red-500 text-xs" />
                      </div>
                      <span className="font-medium">
                        {sheet.questions?.length || 0} Interview Questions
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-xs" />
                      </div>
                      <span className="font-medium">Detailed Solutions</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <FaClock className="text-yellow-500 text-xs" />
                      </div>
                      <span className="font-medium">Progress Tracking</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <FaStar className="text-purple-500 text-xs" />
                      </div>
                      <span className="font-medium">Bookmark Questions</span>
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
        <div
          ref={paymentSectionRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPayment(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowPayment(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
              productType="INTERVIEW_SHEET"
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default SheetLandingPage;
