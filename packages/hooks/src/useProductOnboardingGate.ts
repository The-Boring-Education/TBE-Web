import { getAccessToken, useAuth } from "@tbe/auth";
import { queryKeys, useQuery, useQueryClient } from "@tbe/query";
import { isUserGloballyOnboarded, sendRequest } from "@tbe/utils";
import { useEffect, useMemo, useRef, useState } from "react";

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
 * Fetches the full user with an authenticated request (Bearer access token when present).
 * - If user has already completed this product's onboarding, allows direct access.
 * - If user is globally onboarded from another app, auto-activates this product seamlessly while displaying the tech animation.
 * - If user is not yet onboarded anywhere, redirects to the standalone onboarding app.
 */
export function useProductOnboardingGate({
  pathname,
  publicRoutes,
  productId,
  from,
  buildRedirectUrl,
  isOnboarded,
}: UseProductOnboardingGateOptions): {
  isChecking: boolean;
  isActivating: boolean;
} {
  const onboardingBaseUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_ONBOARDING_URL ||
        process.env.NEXT_PUBLIC_ONBOARDING_APP_URL
      : undefined;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const hasRedirected = useRef(false);
  const isActivatingRef = useRef(false);
  const [isActivating, setIsActivating] = useState(false);
  const queryClient = useQueryClient();

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

  const productOnboarded = useMemo(() => {
    return Boolean(userRecord && isOnboarded(userRecord));
  }, [userRecord, isOnboarded]);

  const globallyOnboarded = useMemo(() => {
    return Boolean(userRecord && isUserGloballyOnboarded(userRecord));
  }, [userRecord]);

  // Auto-activate product for globally onboarded users who visit this app for the first time
  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !user?.id ||
      isPublic ||
      isFetching ||
      isError ||
      !userRecord ||
      productOnboarded ||
      !globallyOnboarded ||
      isActivatingRef.current
    ) {
      return;
    }

    isActivatingRef.current = true;
    setIsActivating(true);

    const activateProduct = async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const userObj =
          typeof userRecord === "object" && userRecord !== null
            ? (userRecord as Record<string, any>)
            : {};

        const normalizedFrom = (from || "").toLowerCase().replace(/[-_]/g, "");

        const subdocOverrides: Record<string, any> = {};
        if (normalizedFrom === "oncampus") {
          subdocOverrides.oncampus = {
            ...(userObj.oncampus || {}),
            onboardingCompleted: true,
          };
        } else if (normalizedFrom === "prepyatra") {
          subdocOverrides.prepYatra = {
            ...(userObj.prepYatra || {}),
            pyOnboarded: true,
          };
        } else if (normalizedFrom === "dsayatra") {
          subdocOverrides.dsaYatra = {
            ...(userObj.dsaYatra || {}),
            dyOnboarded: true,
          };
        } else if (normalizedFrom === "techyatra") {
          subdocOverrides.techYatra = {
            ...(userObj.techYatra || {}),
            tyOnboarded: true,
          };
        } else if (normalizedFrom === "resumeyatra") {
          subdocOverrides.resumeYatra = {
            ...(userObj.resumeYatra || {}),
            ryOnboarded: true,
          };
        }

        await sendRequest({
          url: `/user/onboarding?userId=${encodeURIComponent(user.id!)}`,
          method: "POST",
          headers,
          body: {
            userId: user.id,
            userName: userObj.userName || userObj.name || "developer",
            occupation: userObj.occupation || "TECH_STUDENT",
            purpose: Array.isArray(userObj.purpose)
              ? userObj.purpose
              : [userObj.purpose || "web_dev"],
            contactNo: userObj.contactNo || "+91",
            from,
            isOnboarded: true,
            ...subdocOverrides,
          },
        });

        // Update query cache directly so the gate immediately recognizes product is onboarded
        if (queryClient) {
          queryClient.setQueryData(
            queryKeys.user.onboardingGate(user.id!),
            (oldData: any) => {
              if (!oldData || typeof oldData !== "object") return oldData;
              return {
                ...oldData,
                isOnboarded: true,
                ...subdocOverrides,
              };
            },
          );
        }

        // Keep animation visible smoothly for at least 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Invalidate queries to ensure latest backend sync
        if (queryClient && queryClient.invalidateQueries) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.user.onboardingGate(user.id!),
          });
        }
      } catch (e) {
        console.error("Auto-activating product onboarding failed", e);
      } finally {
        setIsActivating(false);
      }
    };

    activateProduct();
  }, [
    authLoading,
    isAuthenticated,
    user,
    isPublic,
    isFetching,
    isError,
    userRecord,
    productOnboarded,
    globallyOnboarded,
    from,
    queryClient,
  ]);

  // Redirect brand new un-onboarded users to standalone onboarding
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id || isPublic) {
      return;
    }
    if (isFetching || isError || hasRedirected.current) {
      return;
    }
    if (userRecord == null) {
      return;
    }
    // If user is already product onboarded or globally onboarded (auto-activating above), do not redirect
    if (productOnboarded || globallyOnboarded) {
      return;
    }

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
    productOnboarded,
    globallyOnboarded,
    isError,
    onboardingBaseUrl,
  ]);

  const isChecking =
    !isPublic &&
    Boolean(isAuthenticated && user?.id) &&
    (isFetching ||
      isActivating ||
      (!isError &&
        userRecord !== undefined &&
        userRecord !== null &&
        !productOnboarded &&
        (!globallyOnboarded ? Boolean(onboardingBaseUrl) : true)));

  return { isChecking, isActivating };
}
