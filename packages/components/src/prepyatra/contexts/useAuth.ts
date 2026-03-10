import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      loading: false,
      // no-op fallbacks to avoid runtime crashes when provider is missing
      signIn: async () => {},
      signOut: async () => {},
      checkAuth: async () => {},
    } as const as import("./AuthContext").AuthContextType;
  }
  return context;
};

export const useUser = () => {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userPicture: user?.picture,
  };
};
