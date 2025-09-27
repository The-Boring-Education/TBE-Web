import { APIResponseType } from "@/lib/interfaces"

export const sendAPIResponse = ({
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
