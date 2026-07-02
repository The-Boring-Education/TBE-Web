import { useAuth } from "@tbe/auth";
import {
  clearAnalyticsUser,
  PENDING_AUTH_ANALYTICS_KEY,
  setAnalyticsUser,
  trackLoginSuccess,
  trackLogout,
  trackSignupSuccess,
} from "@tbe/utils";
import { useEffect, useRef } from "react";

interface PendingAuthAnalytics {
  userId: string;
  isNewUser: boolean;
}

const readPendingAuthAnalytics = (): PendingAuthAnalytics | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_AUTH_ANALYTICS_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_AUTH_ANALYTICS_KEY);
    const parsed = JSON.parse(raw) as PendingAuthAnalytics;
    if (!parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Syncs GA4 User-ID with auth state and fires login/signup/logout lifecycle events.
 * Call once per app shell (via useTracking or AnalyticsWrapper).
 */
const useAuthAnalytics = (): void => {
  const { user, isLoading } = useAuth();
  const previousUserIdRef = useRef<string | null>(null);
  const pendingProcessedRef = useRef(false);

  useEffect(() => {
    if (isLoading || pendingProcessedRef.current) return;

    const pending = readPendingAuthAnalytics();
    if (pending) {
      pendingProcessedRef.current = true;
      setAnalyticsUser(pending.userId);
      if (pending.isNewUser) {
        trackSignupSuccess(pending.userId);
      } else {
        trackLoginSuccess(pending.userId);
      }
      previousUserIdRef.current = pending.userId;
      return;
    }

    pendingProcessedRef.current = true;
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (currentUserId) {
      setAnalyticsUser(currentUserId);
      previousUserIdRef.current = currentUserId;
      return;
    }

    if (previousUserId) {
      trackLogout(previousUserId);
      clearAnalyticsUser();
      previousUserIdRef.current = null;
    }
  }, [user?.id, isLoading]);
};

export default useAuthAnalytics;
