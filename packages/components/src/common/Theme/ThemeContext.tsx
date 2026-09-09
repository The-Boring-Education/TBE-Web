"use client";

import { createContext, useContext } from "react";

const HasThemeProviderContext = createContext(false);

export const HasThemeProvider = HasThemeProviderContext.Provider;

/** Returns true when the tree is wrapped in `@tbe/components` ThemeProvider. */
export const useHasThemeProvider = () => useContext(HasThemeProviderContext);
