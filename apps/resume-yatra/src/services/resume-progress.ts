import type {
    GetProgressResponse,
    SaveProgressRequest,
    SaveProgressResponse} from "@/types/resume"

const API_BASE_URL = "/api/resume"

export const resumeProgressService = {
    async saveProgress(
        data: SaveProgressRequest
    ): Promise<SaveProgressResponse> {
        const response = await fetch(`${API_BASE_URL}/save-progress`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to save progress")
        }

        return response.json()
    },

    async getProgress(): Promise<GetProgressResponse> {
        const response = await fetch(`${API_BASE_URL}/get-progress`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Failed to fetch progress")
        }

        return response.json()
    }
}
