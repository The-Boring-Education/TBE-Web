"use client";

import { AuthProvider } from "@tbe/auth";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster as Sonner } from "@ui/sonner";
import { Toaster } from "@ui/toaster";
import { TooltipProvider } from "@ui/tooltip";
import { type Session } from "next-auth";
import { useState } from "react";
import { TimeTrackerProvider } from "./TimeTrackerProvider";

export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AuthProvider session={session}>
      <TimeTrackerProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </TimeTrackerProvider>
    </AuthProvider>
  );
}

