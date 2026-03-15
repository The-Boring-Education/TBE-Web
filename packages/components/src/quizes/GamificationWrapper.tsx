"use client";

import { useAuth } from "@tbe/auth";

import { GamificationProvider } from "./context/GamificationContext";

interface GamificationWrapperProps {
  children: React.ReactNode;
}

export function GamificationWrapper({ children }: GamificationWrapperProps) {
  const { user } = useAuth();

  return (
    <GamificationProvider userId={user?.id}>{children}</GamificationProvider>
  );
}
