// src/hooks/useOnboardingRedirect.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useUser from './useUser';
import { UserResponse } from '@/interfaces';

const useOnboardingRedirect = () => {
    const router = useRouter();
    const { user, loading }: { user: UserResponse | null; loading: boolean } = useUser();

    useEffect(() => {
        if (!loading && user && user.isOnboarded === false) {
            const next = router.asPath;
            router.push(`/onboarding?redirectTo=${encodeURIComponent(next)}`);
        }
    }, [user, loading, router]);
};

export default useOnboardingRedirect;
