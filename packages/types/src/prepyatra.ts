export interface PrepYatraUser {
    pyOnboarded: boolean
    experienceLevel?: string
    workDomain?: string
    goal?: string
    currentRole?: string
    targetRole?: string
    skills: string[]
    interests: string[]
}

export interface Challenge {
    _id: string
    title: string
    description: string
    category: string
    difficulty: "beginner" | "intermediate" | "advanced"
    estimatedTime: number
    skills: string[]
    resources: Resource[]
    milestones: Milestone[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Resource {
    type: "article" | "video" | "course" | "book" | "tool"
    title: string
    url: string
    description?: string
    estimatedTime?: number
}

export interface Milestone {
    title: string
    description: string
    completed: boolean
    completedAt?: Date
}

export interface PrepLog {
    _id: string
    userId: string
    challengeId?: string
    activity: string
    description?: string
    duration: number
    date: Date
    skills: string[]
    reflection?: string
}
