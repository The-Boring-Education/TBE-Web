"use client";

import { useAuth } from "@tbe/auth";
import { Footer, Navbar } from "@tbe/components";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative z-[100]">
        <Navbar
          userId={user?.id}
          onSignOut={signOut}
          variant="resources"
          theme="dark"
        />
      </div>
      <main className="flex-1 pt-[72px] relative z-10">{children}</main>
      <Footer variant="resources" />
    </div>
  );
}
