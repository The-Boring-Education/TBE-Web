import { getAccessToken, useAuth } from "@tbe/auth";
import { queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { useEffect, useMemo, useRef } from "react";

export interface UseProductOnboardingGateOptions {
  /** Current route path, e.g. `router.pathname` or `usePathname()` */
  pathname: string;
  /** Paths where onboarding is not enforced */
  publicRoutes: string[];
  /** `productId` query param for the standalone onboarding app */
  productId: string;
  /** `from` query param for analytics / user.from */
  from: string;
  /** Where to send the user after they finish onboarding */
  buildRedirectUrl: () => string;
  /** Return true when the user already completed onboarding for this product */
  isOnboarded: (userData: unknown) => boolean;
}

/**
 * Fetches the full user with an authenticated request (Bearer access token when present)
 * and redirects to the external onboarding app when `isOnboarded` is false.
 */
export function useProductOnboardingGate({
  pathname,
  publicRoutes,
  productId,
  from,
  buildRedirectUrl,
  isOnboarded,
}: UseProductOnboardingGateOptions): { isChecking: boolean } {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const hasRedirected = useRef(false);

  const isPublic = useMemo(
    () => publicRoutes.includes(pathname),
    [publicRoutes, pathname],
  );

  const enabled =
    !authLoading &&
    isAuthenticated &&
    Boolean(user?.id) &&
    !isPublic &&
    !hasRedirected.current;

  const {
    data: userRecord,
    isFetching,
    isError,
  } = useQuery({
    queryKey: queryKeys.user.onboardingGate(user?.id ?? "__none__"),
    queryFn: async () => {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = (await sendRequest({
        url: `/user?userId=${encodeURIComponent(user!.id!)}`,
        method: "GET",
        headers,
      })) as { status?: boolean; data?: unknown; success?: boolean };

      if (res.data !== undefined && res.data !== null) {
        return res.data;
      }
      if (
        (res as { success?: boolean }).success &&
        (res as { data?: unknown }).data
      ) {
        return (res as { data: unknown }).data;
      }
      return null;
    },
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id || isPublic) {
      return;
    }
    if (isFetching) {
      return;
    }
    if (isError) {
      return;
    }
    if (hasRedirected.current) return;

    if (userRecord == null) {
      return;
    }
    if (isOnboarded(userRecord)) {
      return;
    }

    const onboardingBaseUrl =
      typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_ONBOARDING_URL ||
          process.env.NEXT_PUBLIC_ONBOARDING_APP_URL
        : undefined;

    if (!onboardingBaseUrl) {
      return;
    }

    hasRedirected.current = true;
    const params = new URLSearchParams({
      userId: user.id,
      email: user.email ?? "",
      productId,
      from,
      redirect: buildRedirectUrl(),
    });
    const base = onboardingBaseUrl.replace(/\/$/, "");
    window.location.href = `${base}/?${params.toString()}`;
  }, [
    authLoading,
    isAuthenticated,
    user,
    isPublic,
    isFetching,
    userRecord,
    productId,
    from,
    buildRedirectUrl,
    isOnboarded,
    isError,
  ]);

  const isChecking =
    !isPublic && Boolean(isAuthenticated && user?.id) && isFetching;

  return { isChecking };
}
