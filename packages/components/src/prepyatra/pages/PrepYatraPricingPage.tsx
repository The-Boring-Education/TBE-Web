import { useAuth } from "@tbe/auth";
import { useCashfreePayment } from "@tbe/hooks";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Button from "../../common/Buttons/Button";
import Footer from "../../layout/Footer";
import Navbar from "../../layout/Navbar";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  popular?: boolean;
  features: string[];
  comingSoon?: string[];
  description: string;
  buttonText: string;
  savings?: string;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    duration: "Forever",
    description: "Perfect for getting started with interview preparation",
    buttonText: "Current Plan",
    features: [
      "Track unlimited preparation logs",
      "Basic recruiter contact management",
      "Personal dashboard with stats",
      "Basic gamification features",
      "Progress tracking",
    ],
  },
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: 199,
    duration: "per month",
    popular: true,
    description: "Enhanced features for serious interview preparation",
    buttonText: "Upgrade to Pro",
    features: [
      "Everything in Free Plan",
      "Advanced analytics and insights",
      "Custom interview preparation roadmaps",
      "Priority support",
      "Advanced recruiter CRM features",
      "Interview scheduling integration",
      "Performance analytics dashboard",
    ],
    comingSoon: [
      "AI-powered interview question recommendations",
      "Mock interview scheduling",
      "Progress sharing with mentors",
    ],
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    price: 1999,
    duration: "per year",
    savings: "Save ₹389",
    description: "Best value for long-term interview preparation",
    buttonText: "Upgrade to Pro Yearly",
    features: [
      "Everything in Pro Monthly",
      "2 months free (₹389 savings)",
      "Priority customer support",
      "Early access to new features",
      "Advanced reporting features",
      "Export data capabilities",
    ],
    comingSoon: [
      "1-on-1 mentorship sessions",
      "Custom company-specific prep guides",
      "Interview performance predictions",
    ],
  },
];

/**
 * Prep Yatra pricing — Cashfree checkout when configured.
 */
export function PrepYatraPricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { launchPayment, isCashfreeLoaded } = useCashfreePayment();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSelectPlan = async (planId: string) => {
    if (planId === "free") {
      return;
    }

    if (!user?.id) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId,
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create payment session");
      }

      const { paymentSessionId } = await response.json();

      if (isCashfreeLoaded) {
        launchPayment(
          paymentSessionId,
          (data) => {
            console.log("Payment successful:", data);
            router.push("/dashboard?payment=success");
          },
          (data) => {
            console.error("Payment failed:", data);
            router.push("/pricing?payment=failed");
          },
          () => {
            console.log("Payment dialog closed");
          },
        );
      }
    } catch (error) {
      console.error("Error creating payment session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <Navbar variant="prepyatra" />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
            Choose Your <span className="text-[#e53935]">PrepYatra</span> Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Accelerate your interview preparation with our premium features.
            Start for free and upgrade when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white transition-all duration-300 ${
                plan.popular
                  ? "border-[#ff4d4d] shadow-xl scale-105"
                  : "border-gray-200 shadow-sm hover:border-[#ff4d4d]/40"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#fff0f0] border border-[#ff4d4d]/50 text-[#e53935] font-bold px-3 py-1">
                  <Star className="w-3.5 h-3.5 mr-1 fill-[#e53935]" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pt-8">
                <div className="flex justify-center mb-3">
                  {plan.id === "free" && (
                    <Zap className="w-8 h-8 text-[#e53935]" />
                  )}
                  {plan.id === "pro_monthly" && (
                    <Star className="w-8 h-8 text-[#e53935]" />
                  )}
                  {plan.id === "pro_yearly" && (
                    <Crown className="w-8 h-8 text-[#e53935]" />
                  )}
                </div>

                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  {plan.description}
                </CardDescription>

                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    /{plan.duration}
                  </span>
                  {plan.savings && (
                    <div className="text-xs text-[#e53935] font-bold mt-1">
                      {plan.savings}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  variant={plan.popular ? "PRIMARY" : "SECONDARY"}
                  className={`w-full font-bold ${
                    plan.popular
                      ? "bg-[#ff4d4d] hover:bg-[#e53935] text-white"
                      : "bg-white border border-gray-300 text-gray-800 hover:border-[#ff4d4d] hover:text-[#e53935]"
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading || plan.id === "free"}
                  text={loading ? "Processing..." : plan.buttonText}
                />

                <div className="space-y-3">
                  <h4 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">What's included:</h4>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-[#e53935] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.comingSoon && plan.comingSoon.length > 0 && (
                    <>
                      <h4 className="font-semibold text-xs text-[#e53935] pt-3 uppercase tracking-wider">
                        Coming Soon:
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {plan.comingSoon.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Zap className="w-4 h-4 text-[#e53935] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 font-medium">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-xs text-gray-500">
            Have questions?{" "}
            <a
              href="mailto:support@theboringeducation.com"
              className="text-[#e53935] font-semibold hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

