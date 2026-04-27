"use client";

import { ThemeContext, useThemeProvider } from "@tbe/hooks";
import { TBEQueryProvider } from "@tbe/query";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const themeProps = useThemeProvider();
  const content = (
    <ThemeContext.Provider value={themeProps}>
      {children as Parameters<typeof TBEQueryProvider>[0]["children"]}
    </ThemeContext.Provider>
  );
  return <TBEQueryProvider>{content}</TBEQueryProvider>;
}
