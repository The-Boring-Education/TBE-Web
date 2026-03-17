import type { AuthUser } from "@tbe/auth";
import { useAuth } from "@tbe/auth";

interface UseUserReturnType {
  user: AuthUser | null;
  isAuth: boolean;
  loading: boolean;
  isOnboarded: boolean;
  updateSession: () => Promise<void>;
}

const useUser = (): UseUserReturnType => {
  const { user, isAuthenticated, isLoading, refreshSession } = useAuth();

  return {
    user,
    isAuth: isAuthenticated,
    loading: isLoading,
    isOnboarded: user?.isOnboarded ?? false,
    updateSession: refreshSession,
  };
};

export default useUser;
