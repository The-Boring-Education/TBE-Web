"use client";

import type { ThemeProviderProps } from "@tbe/interface";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { HasThemeProvider } from "./ThemeContext";

const ThemeProvider = ({
  children,
  defaultTheme = "light",
  attribute = "class",
  enableSystem = false,
  disableTransitionOnChange = true,
}: ThemeProviderProps) => (
  <HasThemeProvider value>
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      disableTransitionOnChange={disableTransitionOnChange}
      enableSystem={enableSystem}
    >
      {children}
    </NextThemesProvider>
  </HasThemeProvider>
);

export default ThemeProvider;
