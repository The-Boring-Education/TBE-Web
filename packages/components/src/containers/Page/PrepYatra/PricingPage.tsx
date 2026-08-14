import React, { useState } from "react";

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

const PricingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const plans: PricingPlan[] = [
    {
      id: "1months",
      name: "1 Months Access",
      price: 199,
      duration: "1 months",
      description: "Perfect for quick interview preparation",
      buttonText: "Start 1-Month Plan",
      features: [
        "✅ Complete Interview Question Bank",
        "✅ MNC Interview Prep (DSA + System Design + Tech)",
        "✅ MERN Stack Interview Prep",
        "✅ College Placement Prep + Aptitude",
        "✅ System Design Resources & Case Studies",
        "✅ Resume Building Workshop Access",
        "✅ Job Application Strategy Workshop",
        "✅ Personalized Question Prioritization",
        "✅ Company-Specific Question Filtering",
        "✅ Progress Tracking & Analytics",
      ],
      comingSoon: [
        "🔄 Auto Cold Email Generation",
        "🔄 LinkedIn Progress Auto-posting",
      ],
    },
    {
      id: "3months",
      name: "3 Months Access",
      price: 499,
      duration: "3 months",
      description: "Perfect for quick interview preparation",
      buttonText: "Start 3-Month Plan",
      features: [
        "✅ Complete Interview Question Bank",
        "✅ MNC Interview Prep (DSA + System Design + Tech)",
        "✅ MERN Stack Interview Prep",
        "✅ College Placement Prep + Aptitude",
        "✅ System Design Resources & Case Studies",
        "✅ Resume Building Workshop Access",
        "✅ Job Application Strategy Workshop",
        "✅ Personalized Question Prioritization",
        "✅ Company-Specific Question Filtering",
        "✅ Progress Tracking & Analytics",
      ],
      comingSoon: [
        "🔄 Auto Cold Email Generation",
        "🔄 LinkedIn Progress Auto-posting",
      ],
    },
    {
      id: "6months",
      name: "6 Months Access",
      price: 999,
      duration: "6 months",
      popular: true,
      savings: "Save ₹100",
      description: "Most popular choice for comprehensive preparation",
      buttonText: "Start 6-Month Plan",
      features: [
        "✅ Everything in 3-Month Plan",
        "✅ Extended preparation timeline",
        "✅ Advanced System Design Deep Dives",
        "✅ Mock Interview Question Sets",
        "✅ Industry-Specific Preparation Tracks",
        "✅ Priority Email Support",
        "✅ Exclusive Career Guidance Sessions",
        "✅ Salary Negotiation Masterclass",
      ],
      comingSoon: [
        "🔄 Auto Cold Email Generation",
        "🔄 LinkedIn Progress Auto-posting",
        "🔄 AI-Powered Interview Simulator",
      ],
    },
    {
      id: "12months",
      name: "1 Year Access",
      price: 1799,
      duration: "12 months",
      description: "A full year for deep preparation and revision",
      buttonText: "Start 1-Year Plan",
      features: [
        "✅ Everything in 6-Month Plan",
        "✅ Long-term roadmap and spaced revision",
        "✅ Extended mocks and deep dives",
        "✅ Priority support",
      ],
      comingSoon: [
        "🔄 Auto Cold Email Generation",
        "🔄 LinkedIn Progress Auto-posting",
      ],
    },
    {
      id: "lifetime",
      name: "Lifetime Access",
      price: 1999,
      duration: "lifetime",
      savings: "Best Value - Save ₹200",
      description: "One-time payment, lifetime access to everything",
      buttonText: "Get Lifetime Access",
      features: [
        "✅ Everything in 5-Month Plan",
        "✅ Lifetime access to all current & future content",
        "✅ Auto Cold Email Generation (Coming Soon)",
        "✅ LinkedIn Progress Auto-posting (Coming Soon)",
        "✅ Future Feature Access Included",
        "✅ Premium Community Access",
        "✅ 1-on-1 Career Mentorship Session",
        "✅ Custom Interview Preparation Roadmap",
        "✅ Exclusive Job Referral Network Access",
        "✅ White-label Resume Templates",
      ],
    },
  ];

  const interviewCategories = [
    {
      title: "MNC Interview Prep",
      description: "DSA + System Design + General Tech Questions",
      icon: "🏢",
    },
    {
      title: "MERN Stack Interview Prep",
      description: "JS + React + Node + DSA + System Design + General Tech",
      icon: "⚛️",
    },
    {
      title: "College Placement Prep",
      description: "DSA + Basic System Design + General Tech + Aptitude",
      icon: "🎓",
    },
    {
      title: "Remote Job Interview Prep",
      description: "Remote-specific questions + Communication skills",
      icon: "🌍",
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would integrate with your payment system
    console.log("Selected plan:", planId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            PrepYatra
            <span className="text-[#e53935]">
              {" "}
              Interview Mastery
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Complete Interview Preparation Bundle with Personalized Experience
          </p>
          <div className="inline-block bg-[#fff0f0] border border-[#ff4d4d]/30 text-[#e53935] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
            🎉 Prep Logs & Recruiter Contact Management - Always FREE!
          </div>
        </div>

        {/* Interview Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What You'll Get Access To
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-[#ff4d4d]/30"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {category.title}
                </h3>
                <p className="text-gray-500 text-xs">{category.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Choose Your Preparation Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-[#ff4d4d] shadow-xl scale-105"
                    : "border-gray-200 hover:border-[#ff4d4d]/40"
                }`}
              >
                {plan.popular && (
                  <div className="bg-[#fff0f0] border border-[#ff4d4d]/50 text-[#e53935] px-4 py-1 rounded-full text-xs font-bold text-center mb-4">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-extrabold text-gray-900 mb-1">
                    ₹{plan.price}
                  </div>
                  <div className="text-gray-500 text-xs mb-2">
                    for {plan.duration}
                  </div>
                  {plan.savings && (
                    <div className="text-[#e53935] font-bold text-xs">
                      {plan.savings}
                    </div>
                  )}
                  <p className="text-gray-600 text-xs mt-2">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-xs text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                  {plan.comingSoon &&
                    plan.comingSoon.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 opacity-80"
                      >
                        <span className="text-xs text-[#e53935] font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? "bg-[#ff4d4d] hover:bg-[#e53935] text-white shadow-md"
                      : "bg-white border border-gray-300 text-gray-800 hover:border-[#ff4d4d] hover:text-[#e53935]"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose PrepYatra Interview Prep?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#fff0f0] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                Personalized Experience
              </h3>
              <p className="text-gray-500 text-xs">
                Questions tailored to your target companies (Startup, MNC,
                FAANG) and timeline goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#fff0f0] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                Progress Tracking
              </h3>
              <p className="text-gray-500 text-xs">
                Track your preparation progress and get insights on areas to
                focus on.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#fff0f0] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                Complete Package
              </h3>
              <p className="text-gray-500 text-xs">
                From technical questions to resume building and job application
                strategies.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 text-sm cursor-pointer">
                What's the difference between the plans?
              </summary>
              <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                All plans include the same core content. The main differences
                are the access duration and some exclusive features like
                extended workshops and priority support for longer plans.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 text-sm cursor-pointer">
                Can I access TBE webapp interview sheets with this subscription?
              </summary>
              <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                Yes! Your PrepYatra subscription gives you seamless access to
                all interview sheets on the TBE webapp, customized based on your
                preferences.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 text-sm cursor-pointer">
                What about the free features?
              </summary>
              <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                Prep Logs and Recruiter Contact Management will always remain
                free. These help you track your preparation and manage your job
                applications at no cost.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

