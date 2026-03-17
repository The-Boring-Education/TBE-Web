import { useAuthContext } from "../components/AuthProvider";
import type { AuthContextType } from "../types";

export const useAuth = (): AuthContextType => {
  return useAuthContext();
};
