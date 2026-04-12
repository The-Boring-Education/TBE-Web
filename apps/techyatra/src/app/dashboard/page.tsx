"use client";

import { ProtectedRoute } from "@tbe/auth";

/**
 * Minimal protected route so `TechYatraOnboardingGate` can run off the public `/` marketing page.
 * E2E and product flows that require onboarding use paths outside `publicRoutes`.
 */
export default function TechYatraDashboardPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Tech Yatra</h1>
        <p className="text-muted-foreground mt-2">Dashboard</p>
      </main>
    </ProtectedRoute>
  );
}
