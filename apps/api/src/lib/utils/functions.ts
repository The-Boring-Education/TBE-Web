import { APIResponseType, UserPointsActionType } from "@/lib/interfaces"
import { POINTS_RULES } from "../constants"

const sendAPIResponse = ({
    success,
    status,
    error,
    message,
    data
}: APIResponseType): APIResponseType => ({
    success,
    status,
    error,
    message,
    data
})

const calculateUserPointsForAction = (actionType: UserPointsActionType) => {
    const points = POINTS_RULES[actionType as UserPointsActionType] || 0
    return points
}

const constrainNumberToRange = (
    value: number,
    min: number,
    max: number
): number => Math.min(Math.max(value, min), max)

const isProgramActive = (liveOn: Date | string) =>
    new Date(liveOn) <= new Date()

export {
    sendAPIResponse,
    calculateUserPointsForAction,
    constrainNumberToRange,
    isProgramActive
}
