import { useEffect } from "react";
import { useRouter } from "next/router";

export function useOnboardingRedirect(user: any) {
    const router = useRouter();

    useEffect(() => {
        if (user && !user.isOnboarded) {
            const next = router.asPath;
            router.push(`/onboarding?redirectTo=${encodeURIComponent(next)}`);
        }
    }, [user, router]);
}
