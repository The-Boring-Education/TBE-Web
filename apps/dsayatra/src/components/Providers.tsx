"use client";

import { AuthProvider } from "@tbe/auth";
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
          {children}
        </TooltipProvider>
      </TBEQueryProvider>
    </AuthProvider>
  );
}
