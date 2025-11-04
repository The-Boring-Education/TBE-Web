import {PrepYatraFooter, PrepYatraNavbar} from "@tbe/components"
import { Badge } from "@tbe/components"
import { Button } from "@tbe/components"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@tbe/components"
import { useAuth } from "@tbe/components"
import { Check, Crown,Star, Zap } from "lucide-react"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import {useCashfreePayment} from "@tbe/hooks"

interface PricingPlan {
    id: string
    name: string
    price: number
    duration: string
    popular?: boolean
    features: string[]
    comingSoon?: string[]
    description: string
    buttonText: string
    savings?: string
}

const PricingPage: React.FC = () => {
    const router = useRouter()
    const { user, signOut } = useAuth()
    const { launchPayment, isCashfreeLoaded } = useCashfreePayment()
    const [loading, setLoading] = useState(false)

    const plans: PricingPlan[] = [
        {
            id: "free",
            name: "Free Plan",
            price: 0,
            duration: "Forever",
            description:
                "Perfect for getting started with interview preparation",
            buttonText: "Current Plan",
            features: [
                "Track unlimited preparation logs",
                "Basic recruiter contact management",
                "Personal dashboard with stats",
                "Basic gamification features",
                "Progress tracking"
            ]
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
                "Performance analytics dashboard"
            ],
            comingSoon: [
                "AI-powered interview question recommendations",
                "Mock interview scheduling",
                "Progress sharing with mentors"
            ]
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
                "Export data capabilities"
            ],
            comingSoon: [
                "1-on-1 mentorship sessions",
                "Custom company-specific prep guides",
                "Interview performance predictions"
            ]
        }
    ]

    useEffect(() => {
        if (!user) {
            router.push("/auth")
        }
    }, [user, router])

    const handleSelectPlan = async (planId: string) => {
        if (planId === "free") {
            return // Already on free plan
        }

        if (!user?.id) {
            router.push("/auth")
            return
        }

        setLoading(true)

        try {
            // Create payment session
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/payments/create-session`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        planId,
                        userId: user.id,
                        userEmail: user.email,
                        userName: user.name
                    })
                }
            )

            if (!response.ok) {
                throw new Error("Failed to create payment session")
            }

            const { paymentSessionId } = await response.json()

            // Launch Cashfree payment
            if (isCashfreeLoaded) {
                launchPayment(
                    paymentSessionId,
                    (data) => {
                        console.log("Payment successful:", data)
                        router.push("/dashboard?payment=success")
                    },
                    (data) => {
                        console.error("Payment failed:", data)
                        router.push("/pricing?payment=failed")
                    },
                    () => {
                        console.log("Payment dialog closed")
                    }
                )
            }
        } catch (error) {
            console.error("Error creating payment session:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            router.push("/")
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <div className='min-h-screen bg-background'>
            <PrepYatraNavbar
                username={user?.name || ""}
                onSignOut={handleSignOut}
                userId={user?.id}
            />

            <main className='container mx-auto px-4 py-16'>
                <div className='text-center mb-16'>
                    <h1 className='text-4xl font-bold mb-4'>
                        Choose Your{" "}
                        <span className='text-primary'>PrepYatra</span> Plan
                    </h1>
                    <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
                        Accelerate your interview preparation with our premium
                        features. Start for free and upgrade when you're ready.
                    </p>
                </div>

                <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${
                                plan.popular
                                    ? "border-primary shadow-lg scale-105"
                                    : "border-border"
                            }`}>
                            {plan.popular && (
                                <Badge className='absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground'>
                                    <Star className='w-3 h-3 mr-1' />
                                    Most Popular
                                </Badge>
                            )}

                            <CardHeader className='text-center'>
                                <div className='flex justify-center mb-4'>
                                    {plan.id === "free" && (
                                        <Zap className='w-8 h-8 text-blue-500' />
                                    )}
                                    {plan.id === "pro_monthly" && (
                                        <Star className='w-8 h-8 text-primary' />
                                    )}
                                    {plan.id === "pro_yearly" && (
                                        <Crown className='w-8 h-8 text-yellow-500' />
                                    )}
                                </div>

                                <CardTitle className='text-2xl'>
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className='text-sm'>
                                    {plan.description}
                                </CardDescription>

                                <div className='mt-4'>
                                    <span className='text-4xl font-bold'>
                                        ₹{plan.price}
                                    </span>
                                    <span className='text-muted-foreground'>
                                        /{plan.duration}
                                    </span>
                                    {plan.savings && (
                                        <div className='text-sm text-green-600 font-medium mt-1'>
                                            {plan.savings}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className='space-y-4'>
                                    <Button
                                    variant={plan.popular
                                        ? "PRIMARY"
                                        : "SECONDARY"}
                                    className="w-full"
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={loading || plan.id === "free"}
                                    text={loading
                                        ? "Processing..."
                                        : plan.buttonText}
                                    />

                                <div className='space-y-3'>
                                    <h4 className='font-semibold text-sm'>
                                        What's included:
                                    </h4>
                                    <ul className='space-y-2 text-sm'>
                                        {plan.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className='flex items-start'>
                                                <Check className='w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.comingSoon &&
                                        plan.comingSoon.length > 0 && (
                                            <>
                                                <h4 className='font-semibold text-sm text-primary pt-3'>
                                                    Coming Soon:
                                                </h4>
                                                <ul className='space-y-2 text-sm'>
                                                    {plan.comingSoon.map(
                                                        (feature, index) => (
                                                            <li
                                                                key={index}
                                                                className='flex items-start'>
                                                                <Zap className='w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0' />
                                                                <span className='text-muted-foreground'>
                                                                    {feature}
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </>
                                        )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className='text-center mt-16'>
                    <p className='text-muted-foreground'>
                        Have questions?{" "}
                        <a
                            href='mailto:support@theboringeducation.com'
                            className='text-primary hover:underline'>
                            Contact our support team
                        </a>
                    </p>
                </div>
            </main>

            <PrepYatraFooter />
        </div>
    )
}

export default PricingPage
