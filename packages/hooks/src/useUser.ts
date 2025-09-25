import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import type { User, UseUserReturnType } from "@tbe/types"

const useUser = (): UseUserReturnType => {
    const { data: session, status, update } = useSession()
    const [user, setUser] = useState<User>(session?.user as User)
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
        }
    }, [session, status])

    return { user, isAuth, loading, isOnboarded, updateSession: update }
}

export default useUser
