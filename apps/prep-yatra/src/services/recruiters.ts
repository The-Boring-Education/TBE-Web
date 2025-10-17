import { trackEvent } from "@/lib/analytics"
import type { CreateRecruiterContact, RecruiterContact } from "@/types/recruiters"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const recruitersService = {
    async create(data: CreateRecruiterContact): Promise<RecruiterContact> {
        const response = await fetch(`${API_BASE_URL}/prepyatra/recruiter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        try {
            trackEvent("recruiter_contact_create", {
                category: "recruiter",
                name: data.name,
                company: data.company
            })
        } catch {}
        return result.data
    },

    async update(
        id: string,
        data: Partial<CreateRecruiterContact>
    ): Promise<RecruiterContact> {
        const response = await fetch(`${API_BASE_URL}/prepyatra/recruiter`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ recruiterId: id, ...data })
        })

        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        try {
            trackEvent("recruiter_contact_update", {
                category: "recruiter",
                recruiterId: id,
                status: (data as any).status
            })
        } catch {}
        return result.data
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(
            `${API_BASE_URL}/prepyatra/recruiter/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )

        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        try {
            trackEvent("recruiter_contact_delete", {
                category: "recruiter",
                recruiterId: id
            })
        } catch {}
    },

    async getById(id: string): Promise<RecruiterContact> {
        const response = await fetch(
            `${API_BASE_URL}/prepyatra/recruiter/${id}`
        )
        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        return result.data
    },

    async getAll(): Promise<RecruiterContact[]> {
        const response = await fetch(`${API_BASE_URL}/prepyatra/recruiter`)
        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        return result.data || []
    },

    async getByStatus(
        status: RecruiterContact["applicationStatus"]
    ): Promise<RecruiterContact[]> {
        const response = await fetch(
            `${API_BASE_URL}/prepyatra/recruiter?status=${status}`
        )
        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        return result.data || []
    },

    async getByUserId(userId: string): Promise<RecruiterContact[]> {
        const response = await fetch(
            `${API_BASE_URL}/prepyatra/recruiter?userId=${userId}`
        )
        const result = await response.json()
        if (!result.status) {
            throw new Error(result.message)
        }
        return result.data || []
    }
}
