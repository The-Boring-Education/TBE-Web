import type { User,UseUserReturnType } from "@tbe/interface"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const useUser = (): UseUserReturnType => {
    const sessionData = useSession()
    const { data: session, status, update } = sessionData || { data: null, status: "loading", update: null }
    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [isOnboarded, setIsOnboarded] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === "loading") {
            setLoading(true)
        } else {
            setLoading(false)
        }

        if (session?.user) {
            const user = session?.user as User
            setUser(user)
            setIsOnboarded(user.isOnboarded)
            setIsAuth(true)
        } else {
            setIsAuth(false)
            setUser(null)
        }
    }, [session, status])

    return { user, isAuth, loading, isOnboarded, updateSession: update }
}

export default useUser
