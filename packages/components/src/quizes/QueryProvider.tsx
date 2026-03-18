"use client";

import { TBEQueryProvider } from "@tbe/query";
import type { ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
  return <TBEQueryProvider>{children}</TBEQueryProvider>;
};

export default QueryProvider;
