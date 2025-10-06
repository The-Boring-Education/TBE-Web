import { useEffect, useState } from "react"

import { routes } from "@tbe/constants"
import { useApi } from "@tbe/hooks"
import { useUser } from "@tbe/hooks"
import { getUserGamificationLevel } from "@tbe/utils"

const useGamification = () => {
    const { makeRequest } = useApi("useGamification")
    const { user } = useUser()
    const [points, setPoints] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const userId = user?.id
        if (!userId) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                const response = await makeRequest({
                    method: "GET",
                    url: `${routes.api.gamification}?userId=${userId}`,
                    headers: { "Content-Type": "application/json" }
                })

                setPoints(response?.data?.points)
            } catch (error) {
                setError(error as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.id])

    const {
        currentLevel,
        currentLevelName,
        pointsLeftToNextLevel,
        nextLevelName,
        percentageProgress
    } = getUserGamificationLevel(points)

    return {
        loading,
        error,
        points,
        currentLevel,
        currentLevelName,
        pointsLeftToNextLevel,
        nextLevelName,
        percentageProgress
    }
}

export default useGamification
