import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const OnboardingCheck = () => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            // Check if user has completed onboarding
            // Assuming 'onboardingComplete' is a property on the user object
            // If not, we might need to fetch it or check a specific field
            if (user.isOnboarded === false) {
                const onboardingUrl = process.env.NEXT_PUBLIC_ONBOARDING_APP_URL || "http://localhost:5173";
                window.location.href = onboardingUrl;
            }
        }
    }, [user, isLoading, router]);

    return null;
};
