export type InterviewStatus =
    | "Screening"
    | "Interviewing"
    | "Last Round Pending"
    | "Offer Letter"
    | "Rejected"

export interface Recruitment {
    id: string
    name: string
    company?: string
    email?: string
    phone?: string
    interview_status: InterviewStatus
    follow_up_date?: string
    interview_date?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface CreateRecruitmentDTO {
    name: string
    company?: string
    email?: string
    phone?: string
    interview_status?: InterviewStatus
    follow_up_date?: string
    interview_date?: string
    notes?: string
}

export interface UpdateRecruitmentDTO extends Partial<CreateRecruitmentDTO> {
    id: string
}