"use client";

import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from "@tbe/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
}
