"use client";

import { Footer, Navbar } from "@tbe/components";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative z-[100]">
        <Navbar variant="resources" theme="dark" />
      </div>
      <main className="flex-1 pt-[72px] relative z-10">{children}</main>
      <Footer variant="resources" />
    </div>
  );
}
