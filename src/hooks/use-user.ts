import {useAuth} from "@/contexts/useAuth";

export function useUser() {
    const {user, loading} = useAuth();

    return {
        user,
        loading,
        isAuthenticated: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        userPicture: user?.picture
    };
}
