import { useAuth } from "@tbe/auth";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export const OnboardingCheck = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const hasChecked = useRef(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Skip check for public pages
    const publicPages = ["/login", "/", "/auth"];
    if (publicPages.includes(router.pathname)) return;

    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      !hasChecked.current &&
      !isChecking
    ) {
      const checkOnboardingStatus = async () => {
        if (!user?.email) return;

        hasChecked.current = true;
        setIsChecking(true);
        try {
          const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(
            /\/$/,
            "",
          );
          const resp = await fetch(
            `${base}/user?email=${encodeURIComponent(user.email)}`,
          );
          const json = await resp.json();

          const isOnboarded = json?.data?.dsaYatra?.dyOnboarded === true;

          if (!isOnboarded) {
            const onboardingBaseUrl =
              process.env.NEXT_PUBLIC_ONBOARDING_URL ||
              process.env.NEXT_PUBLIC_ONBOARDING_APP_URL;
            if (onboardingBaseUrl) {
              const params = new URLSearchParams({
                userId: user?.id || "",
                email: user?.email || "",
                productId: "dsayatra",
                from: "dsayatra",
                redirect: `${window.location.origin}/dashboard`,
              });
              window.location.href = `${onboardingBaseUrl}/?${params.toString()}`;
            }
          }
        } catch (error) {
          console.error("Error checking onboarding:", error);
        } finally {
          setIsChecking(false);
        }
      };

      void checkOnboardingStatus();
    }
  }, [user, isAuthenticated, isLoading, router.pathname, isChecking]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return null;
};
