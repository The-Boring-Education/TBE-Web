"use client";

import { AuthProvider } from "@tbe/auth";
import { GamificationProvider } from "@tbe/gamification";
import { TBEQueryProvider } from "@tbe/query";
import { Toaster as Sonner } from "@ui/sonner";
import { Toaster } from "@ui/toaster";
import { TooltipProvider } from "@ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TBEQueryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GamificationProvider>{children}</GamificationProvider>
        </TooltipProvider>
      </TBEQueryProvider>
    </AuthProvider>
  );
}
