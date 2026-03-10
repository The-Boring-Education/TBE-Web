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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            PrepYatra
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Interview Mastery
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Complete Interview Preparation Bundle with Personalized Experience
          </p>
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
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
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
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
                    ? "border-purple-500 shadow-xl scale-105"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold text-center mb-4">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₹{plan.price}
                  </div>
                  <div className="text-gray-600 text-sm mb-2">
                    for {plan.duration}
                  </div>
                  {plan.savings && (
                    <div className="text-green-600 font-semibold text-sm">
                      {plan.savings}
                    </div>
                  )}
                  <p className="text-gray-600 text-sm mt-2">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.comingSoon &&
                    plan.comingSoon.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 opacity-70"
                      >
                        <span className="text-sm text-orange-600">
                          {feature}
                        </span>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                      : "bg-gray-900 text-white hover:bg-gray-800"
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Personalized Experience
              </h3>
              <p className="text-gray-600 text-sm">
                Questions tailored to your target companies (Startup, MNC,
                FAANG) and timeline goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                Track your preparation progress and get insights on areas to
                focus on.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Complete Package
              </h3>
              <p className="text-gray-600 text-sm">
                From technical questions to resume building and job application
                strategies.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What's the difference between the plans?
              </summary>
              <p className="text-gray-600 mt-2">
                All plans include the same core content. The main differences
                are the access duration and some exclusive features like
                extended workshops and priority support for longer plans.
              </p>
            </details>
            <details className="bg-white rounded-lg p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I access TBE webapp interview sheets with this subscription?
              </summary>
              <p className="text-gray-600 mt-2">
                Yes! Your PrepYatra subscription gives you seamless access to
                all interview sheets on the TBE webapp, customized based on your
                preferences.
              </p>
            </details>
            <details className="bg-white rounded-lg p-6 border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What about the free features?
              </summary>
              <p className="text-gray-600 mt-2">
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
