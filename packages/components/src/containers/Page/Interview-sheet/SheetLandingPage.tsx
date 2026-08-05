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
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  Percent,
  Play,
  Sparkles,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface SheetLandingPageProps {
  sheet: SheetPageProps["sheet"];
  meta: string;
  slug: string;
  seoMeta: SheetPageProps["seoMeta"];
}

const getTechIconUrls = (sheetSlug?: string, sheetName?: string): string[] => {
  const text = `${sheetSlug || ""} ${sheetName || ""}`.toLowerCase();
  if (text.includes("node") || text.includes("express")) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
    ];
  }
  if (text.includes("react")) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    ];
  }
  if (text.includes("java") && !text.includes("script")) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    ];
  }
  if (text.includes("c++") || text.includes("cpp")) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    ];
  }
  if (text.includes("javascript") || text.includes("js")) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    ];
  }
  if (text.includes("python")) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    ];
  }
  if (
    text.includes("database") ||
    text.includes("db") ||
    text.includes("sql")
  ) {
    return [
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    ];
  }
  return [];
};

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

  const techIconUrls = useMemo(
    () => getTechIconUrls(slug || sheet?.slug, sheet?.name),
    [slug, sheet?.slug, sheet?.name],
  );

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
    const sheetModel = sheet as any;
    return calculatePriceBreakdown(sheetModel, appliedCoupon || undefined);
  }, [sheet, appliedCoupon]);

  const discountInfo = useMemo(() => {
    if (!sheet?.isPremium || !sheet.name) {
      return null;
    }
    const sheetModel = sheet as any;
    return getDiscountDisplayInfo(sheetModel, appliedCoupon || undefined);
  }, [sheet, appliedCoupon]);

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
      window.location.href = `${routes.interviewPrep}/${sheet.slug}`;
    } else if (!isAuth) {
      return;
    } else if (!sheet?.isEnrolled && !sheet?.isPremium) {
      enrollSheet();
    } else {
      handleShowPayment();
    }
  };

  if (!sheet) return null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Background Layer: Dot Density Patterns, Curved Wave Accent Lines & Technology Logo */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft Ambient Hero Spotlights */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-rose-500/15 via-red-500/10 to-transparent blur-3xl opacity-80 rounded-full" />
        <div className="absolute top-[20%] -left-32 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[50%] -right-32 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full" />

        {/* Top-Left Side Dot Grid Density Pattern */}
        <div className="hidden sm:block absolute top-6 left-6 w-36 h-36 opacity-30 dark:opacity-20 pointer-events-none">
          <svg className="w-full h-full text-rose-500/50" fill="currentColor">
            <pattern
              id="sheet-dots-left"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#sheet-dots-left)" />
          </svg>
        </div>

        {/* Top-Right Side Dot Grid Density Pattern */}
        <div className="hidden sm:block absolute top-6 right-6 w-44 h-44 opacity-35 dark:opacity-25 pointer-events-none">
          <svg className="w-full h-full text-rose-500/50" fill="currentColor">
            <pattern
              id="sheet-dots-right"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#sheet-dots-right)" />
          </svg>
        </div>

        {/* Soft Wave Accent Lines */}
        <svg
          className="absolute -top-10 right-0 w-[650px] h-[550px] opacity-25 dark:opacity-15 pointer-events-none"
          viewBox="0 0 650 550"
          fill="none"
        >
          <path
            d="M0 120 Q 325 220 650 70 T 1300 120"
            stroke="url(#hero-wave-grad)"
            strokeWidth="1.5"
          />
          <path
            d="M0 170 Q 325 270 650 120 T 1300 170"
            stroke="url(#hero-wave-grad)"
            strokeWidth="1"
          />
          <path
            d="M0 220 Q 325 320 650 170 T 1300 220"
            stroke="url(#hero-wave-grad)"
            strokeWidth="0.8"
          />
          <defs>
            <linearGradient
              id="hero-wave-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Watermarked Technology Logos (Bottom Left of Hero, Mobile Responsive) */}
        {
          techIconUrls.length > 0 && (
            <div className="absolute top-[260px] -left-6 sm:top-[240px] sm:-left-8 lg:top-[200px] lg:-left-12 pointer-events-none select-none z-0">
              <div className="relative flex flex-col items-center gap-2 sm:gap-3">
                <div className="absolute inset-0 bg-rose-500/15 blur-3xl rounded-full scale-125" />
                {techIconUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    className={`${techIconUrls.length > 1
                      ? "w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44"
                      : "w-28 h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-72 lg:h-72"
                      } object-contain opacity-25 dark:opacity-20 rotate-[-12deg] transition-all duration-300`}
                  />
                ))}
              </div>
            </div>
          )
        }
      </div >

      {/* Page Content Layer (z-10 above ambient backdrop) */}
      < div className="relative z-10" >
        <SEO seoMeta={seoMeta} />

        {/* Hero Section */}
        <Section className="relative bg-transparent border-b border-border/80 text-foreground py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left: Content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Navigation Link */}
                <div>
                  <LinkButton
                    buttonProps={{
                      variant: "GHOST",
                      text: "← Back to Explore",
                      className:
                        "text-muted-foreground hover:text-foreground font-medium p-0 h-auto bg-transparent hover:bg-transparent shadow-none border-none text-xs",
                    }}
                    href={routes.interviewPrepExplore}
                  />
                </div>

                {/* Tag Badge */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <span className="font-mono text-xs font-bold">
                      &lt;/&gt;
                    </span>
                    <span>
                      Master{" "}
                      {sheet.name?.replace(" Interview Questions", "") ||
                        "Tech"}
                      . Crack Interviews.
                    </span>
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h1 className="font-headings font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight">
                    {sheet.name?.includes("Interview Questions") ? (
                      <>
                        {sheet.name.replace(" Interview Questions", "")}{" "}
                        <span className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">
                          Interview Questions
                        </span>
                      </>
                    ) : (
                      sheet.name
                    )}
                  </h1>
                  <Text
                    level="p"
                    className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed"
                  >
                    {sheet.description}
                  </Text>
                </div>

                {/* Stats Pills */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-rose-500/40 transition-all">
                    <Play className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{sheet.questions?.length || 0} Questions</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-rose-500/40 transition-all">
                    <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>
                      ~{Math.ceil((sheet.questions?.length || 0) * 2)} min
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-foreground text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-2xs hover:border-rose-500/40 transition-all">
                    <Users className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>All Experience Levels</span>
                  </div>
                  {isPurchased ? (
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Full Access Granted</span>
                    </div>
                  ) : sheet.isPremium ? (
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Premium Sheet</span>
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
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
                      variant="PRIMARY"
                      className="px-8 py-3.5 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-none"
                      onClick={handleStartNow}
                      isLoading={loading}
                    />
                  )}

                  {sheet?.isPremium && !isPurchased && (
                    <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/80 text-muted-foreground text-xs font-medium px-4 py-2 rounded-lg shadow-2xs">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>₹{sheet.price} · Lifetime Access</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Preview Card */}
              <div className="lg:col-span-1">
                <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl shadow-xl p-6 sm:p-8 text-foreground space-y-5 relative overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-rose-500/10 via-red-500/5 to-amber-500/5 border border-rose-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-inner">
                    <Play className="w-10 h-10 text-rose-500 relative z-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-headings font-bold text-lg text-foreground">
                      Preview Sheet Questions
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get a quick overview of question formats and difficulty
                      levels before diving in.
                    </p>
                  </div>
                  <Button
                    text="Preview Questions ↓"
                    variant="OUTLINE"
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border-rose-500/30 text-rose-600 hover:bg-rose-500/10 shadow-none transition-all"
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

        {/* Main Content Section */}
        <Section className="py-10 bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                    <BookOpen className="w-5 h-5 text-primary shrink-0" />
                    <h2 className="font-headings font-bold text-xl text-foreground">
                      About This Sheet
                    </h2>
                  </div>
                  <div className="prose prose-slate max-w-none text-foreground text-sm leading-relaxed">
                    <MDXRenderer mdxSource={sheet.meta || meta || ""} />
                  </div>
                </div>

                {/* What You'll Learn */}
                {
                  sheet?.features && sheet.features.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                      <div className="flex items-center gap-2.5 border-b border-border/60 pb-3.5">
                        <Sparkles className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="font-headings font-bold text-xl text-foreground">
                          What You'll Learn
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {sheet.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2.5 bg-muted/30 rounded-lg p-3 border border-border/50 text-xs sm:text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <Text
                              level="p"
                              className="text-foreground font-medium leading-snug"
                            >
                              {feature}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Preview Questions Section (Subtle & Compact) */}
                <div
                  id="preview-section"
                  className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4"
                >
                  <div className="border-b border-border/60 pb-3 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-primary shrink-0" />
                      <h3 className="font-headings font-bold text-base sm:text-lg text-foreground">
                        Preview Questions
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      First {previewQuestions.length} questions included in
                      preview:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {previewQuestions.map((q, index) => (
                      <div
                        key={q._id.toString()}
                        className="group bg-card border border-border/70 hover:border-primary/30 rounded-lg p-3 sm:p-3.5 transition-all duration-150 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-bold text-primary shrink-0">
                              #{index + 1}
                            </span>
                            <h4 className="font-headings font-semibold text-foreground text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                              {q.title}
                            </h4>
                          </div>
                          {q.frequency && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                              <Star className="w-3 h-3 text-amber-500" />
                              {q.frequency}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                          {q.question}
                        </p>
                      </div>
                    ))}
                  </div>

                  {lockedQuestions.length > 6 && (
                    <p className="text-center text-[11px] text-muted-foreground">
                      + {lockedQuestions.length - 6} additional questions
                      included...
                    </p>
                  )}

                  {isLocked && !isPurchased && (
                    <Button
                      text={`Unlock All ${sheet.questions?.length} Questions · ${priceBreakdown ? formatPrice(priceBreakdown.finalPrice) : formatPrice(sheet.price || 0)}`}
                      variant="PRIMARY"
                      onClick={handleShowPayment}
                      className="w-full py-2.5 text-xs sm:text-sm font-semibold rounded-lg shadow-xs"
                    />
                  )}
                  {isPurchased && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center space-y-0.5">
                      <p className="text-xs font-bold text-emerald-600">
                        ✓ All Questions Unlocked
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        You have full access to all {sheet.questions?.length}{" "}
                        questions.
                      </p>
                    </div>
                  )}
                </div>

                {/* Locked Content Section (Subtle & Compact) */}
                {
                  lockedQuestions.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          {isPurchased ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-primary shrink-0" />
                          )}
                          <h3 className="font-headings font-bold text-base sm:text-lg text-foreground">
                            {lockedQuestions.length} More Questions
                          </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isPurchased ? "All unlocked" : "Locked content"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {lockedQuestions.slice(0, 6).map((q, index) => (
                          <div
                            key={q._id.toString()}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-xs ${isPurchased
                              ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                              : "bg-muted/20 border-border/50 text-muted-foreground"
                              }`}
                          >
                            {isPurchased ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                            )}
                            <span className="font-medium truncate flex-1">
                              {previewQuestions.length + index + 1}. {q.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {lockedQuestions.length > 6 && (
                        <p className="text-center text-[11px] text-muted-foreground">
                          + {lockedQuestions.length - 6} additional questions
                          included...
                        </p>
                      )}

                      {
                        isLocked && !isPurchased && (
                          <Button
                            text={`Unlock All ${sheet.questions?.length} Questions · ${priceBreakdown ? formatPrice(priceBreakdown.finalPrice) : formatPrice(sheet.price || 0)}`}
                            variant="PRIMARY"
                            onClick={handleShowPayment}
                            className="w-full py-2.5 text-xs sm:text-sm font-semibold rounded-lg shadow-xs"
                          />
                        )
                      }
                      {
                        isPurchased && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center space-y-0.5">
                            <p className="text-xs font-bold text-emerald-600">
                              ✓ All Questions Unlocked
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              You have full access to all {sheet.questions?.length}{" "}
                              questions.
                            </p>
                          </div>
                        )
                      }
                    </div >
                  )
                }
              </div >

              {/* Sidebar (Right 1 col) */}
              < div className="lg:col-span-1" >
                <div className="sticky top-6 space-y-5">
                  {/* Action Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="text-center space-y-3">
                      {sheet?.isPremium && !isPurchased && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold">
                            ⭐ Premium Sheet
                          </span>
                          {discountInfo?.showDiscountBadge && (
                            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              {discountInfo.discountText}
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        {isPurchased ? (
                          <div className="space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                            <h3 className="font-headings font-bold text-xl text-emerald-600">
                              Access Purchased
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Lifetime Access Granted
                            </p>
                          </div>
                        ) : !sheet?.isPremium ? (
                          <div className="space-y-1">
                            <h3 className="font-headings font-bold text-3xl text-foreground">
                              Free Access
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              No payment required
                            </p>
                          </div>
                        ) : priceBreakdown ? (
                          <div className="space-y-2">
                            {priceBreakdown.savings > 0 && (
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(priceBreakdown.originalPrice)}
                                </span>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
                                  {getSavingsPercentage(
                                    priceBreakdown.originalPrice,
                                    priceBreakdown.finalPrice,
                                  )}
                                  % OFF
                                </span>
                              </div>
                            )}
                            <h3 className="font-headings font-bold text-4xl text-foreground">
                              {formatPrice(priceBreakdown.finalPrice)}
                            </h3>
                            {priceBreakdown.savings > 0 && (
                              <p className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full inline-block border border-emerald-500/20">
                                🎉 Save {formatPrice(priceBreakdown.savings)}!
                              </p>
                            )}
                          </div>
                        ) : (
                          <h3 className="font-headings font-bold text-4xl text-foreground">
                            {formatPrice(sheet.price || 0)}
                          </h3>
                        )}
                      </div>

                      {/* Price Breakdown */}
                      {sheet?.isPremium &&
                        priceBreakdown &&
                        priceBreakdown.savings > 0 && (
                          <div className="bg-muted/40 rounded-xl p-3.5 text-left space-y-1.5 border border-border/60 text-xs">
                            <p className="font-bold text-foreground mb-2">
                              💰 Price Breakdown
                            </p>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Original Price
                              </span>
                              <span className="font-medium">
                                {formatPrice(priceBreakdown.originalPrice)}
                              </span>
                            </div>
                            {priceBreakdown.discountAmount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>
                                  Discount ({priceBreakdown.discountPercentage}
                                  %)
                                </span>
                                <span className="font-medium">
                                  -{formatPrice(priceBreakdown.discountAmount)}
                                </span>
                              </div>
                            )}
                            {priceBreakdown.couponDiscount > 0 &&
                              appliedCoupon && (
                                <div className="flex justify-between text-emerald-600">
                                  <span>Coupon ({appliedCoupon.code})</span>
                                  <span className="font-medium">
                                    -
                                    {formatPrice(priceBreakdown.couponDiscount)}
                                  </span>
                                </div>
                              )}
                            <hr className="border-border my-1.5" />
                            <div className="flex justify-between font-bold text-foreground">
                              <span>Final Price</span>
                              <span className="text-primary">
                                {formatPrice(priceBreakdown.finalPrice)}
                              </span>
                            </div>
                          </div>
                        )}

                      {/* Coupon Input */}
                      {sheet?.isPremium && !appliedCoupon && !isPurchased && (
                        <div className="bg-muted/40 rounded-xl p-3.5 border border-border/60 space-y-2.5 text-left">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Tag className="w-3.5 h-3.5 text-primary" />
                            <span>Have a coupon?</span>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="ENTER CODE"
                              value={couponCode}
                              onChange={(e) =>
                                setCouponCode(e.target.value.toUpperCase())
                              }
                              className="w-full px-3 py-2 border border-border rounded-lg text-xs font-semibold bg-background text-foreground text-center focus:outline-none focus:border-primary"
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleApplyCoupon()
                              }
                            />
                            <Button
                              text={
                                couponLoading ? "Applying..." : "Apply Coupon"
                              }
                              variant="PRIMARY"
                              className="w-full py-2 text-xs font-bold rounded-lg"
                              onClick={handleApplyCoupon}
                              isLoading={couponLoading}
                              disabled={!couponCode.trim()}
                            />
                          </div>
                          {couponError && (
                            <p className="text-xs text-destructive font-medium text-center">
                              {couponError}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Applied Coupon Display */}
                      {sheet?.isPremium && appliedCoupon && !isPurchased && (
                        <div className="bg-emerald-500/10 rounded-xl p-3.5 border border-emerald-500/20 text-left">
                          <div className="flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <p className="font-bold text-emerald-600 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />{" "}
                                {appliedCoupon.code} Applied
                              </p>
                              <p className="text-muted-foreground text-[11px]">
                                {appliedCoupon.description}
                              </p>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-xs text-destructive hover:underline font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Main CTA Button */}
                      {
                        !isAuth ? (
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
                            variant="PRIMARY"
                            className="w-full py-3 text-sm font-bold rounded-xl shadow-xs"
                            onClick={handleStartNow}
                            isLoading={loading}
                          />
                        )
                      }

                      {/* Trust Badges */}
                      <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] text-muted-foreground pt-1">
                        <span className="bg-muted px-2.5 py-1 rounded-full border border-border/50">
                          ✓ Instant Access
                        </span>
                        <span className="bg-muted px-2.5 py-1 rounded-full border border-border/50">
                          ✓ Lifetime Access
                        </span>
                      </div>
                    </div >
                  </div >

                  {/* Quick Info */}
                  < div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3" >
                    <h4 className="font-headings font-bold text-sm text-foreground">
                      📚 This sheet includes:
                    </h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-2 py-0.5">
                        <Play className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">
                          {sheet.questions?.length || 0} Interview Questions
                        </span>
                      </div>
                      <div className="flex items-center gap-2 py-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-medium text-foreground">
                          Detailed Solutions & Explanations
                        </span>
                      </div>
                      <div className="flex items-center gap-2 py-0.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">
                          Progress Tracking
                        </span>
                      </div>
                      <div className="flex items-center gap-2 py-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium text-foreground">
                          Bookmark & Practice Mode
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div >
          </div >
        </Section >

        {/* Payment Modal */}
        {
          showPayment && (
            <div
              ref={paymentSectionRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-modal-title"
              className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
              onClick={(e) =>
                e.target === e.currentTarget && setShowPayment(false)
              }
              onKeyDown={(e) => e.key === "Escape" && setShowPayment(false)}
            >
              <div className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <PaymentCard
                  course={{
                    ...sheet,
                    price: priceBreakdown?.finalPrice || sheet.price || 0,
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
      </div>
    </div>
  );
};

export default SheetLandingPage;
