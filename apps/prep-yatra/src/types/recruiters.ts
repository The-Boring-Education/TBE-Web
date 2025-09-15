export interface RecruiterContact {
  _id: string
  user: string
  recruiterName: string
  email?: string
  phone?: string
  company?: string
  appliedPosition?: string
  applicationStatus?: string
  lastContacted?: string
  comments?: string
  follow_up_date?: string
  last_interview_date?: string
  link?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateRecruiterContact {
    name: string
    company?: string
    email?: string
    phone?: string
    status?: "Screening in Process" | "Interviewing" | "Final Round Offer" | "Offer Letter" | "Rejected"
    follow_up_date?: string
    last_interview_date?: string
    link?: string
    comments?: string
}