"use client";

import { useAuthAnalytics } from "@tbe/hooks";
import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from "@tbe/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useAuthAnalytics();

  useEffect(() => {
    initGA();
    installGlobalAnalyticsListeners();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    trackPageview(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
};

export default AnalyticsWrapper;
