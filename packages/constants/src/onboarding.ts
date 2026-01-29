import type {
    ExperienceLevel,
    GoalType,
    CompanyType,
    InterviewCategory
} from "@tbe/types";

export const EXPERIENCE_LEVELS: {
    value: ExperienceLevel
    label: string
    icon: string
}[] = [
    {value: "fresher", label: "0-1 years (Fresher)", icon: "🌱"},
    {value: "junior", label: "1-3 years (Junior)", icon: "💼"},
    {value: "mid", label: "3-5 years (Mid-level)", icon: "🚀"},
    {value: "senior", label: "5+ years (Senior)", icon: "👔"}
];

export const GOALS: {
    value: GoalType
    label: string
    description: string
    icon: string
    popular?: boolean
}[] = [
    {
        value: "GET_JOB",
        label: "3 Months",
        description: "Quick interview preparation",
        icon: "⚡"
    },
    {
        value: "SWITCH_CAREER",
        label: "6 Months",
        description: "Comprehensive preparation",
        icon: "🎯",
        popular: true
    },
    {
        value: "LEARN_NEW_SKILL",
        label: "1 Year",
        description: "Long-term career planning",
        icon: "🌟"
    }
];

export const COMPANY_TYPES: {
    value: CompanyType;
    label: string;
    icon: string;
    description: string;
}[] = [
    {
        value: "STARTUP",
        label: "Startups",
        icon: "🚀",
        description: "Fast-paced, innovative companies",
    },
    {
        value: "MID_SIZE",
        label: "Mid-size Companies",
        icon: "🏢",
        description: "Established growing companies",
    },
    {
        value: "MNC",
        label: "MNCs",
        icon: "🌍",
        description: "Large multinational corporations",
    },
    {
        value: "FAANG",
        label: "FAANG",
        icon: "⭐",
        description: "Top tech giants (Meta, Apple, Amazon, Netflix, Google)",
    },
];


export const INTERVIEW_CATEGORIES: {
    value: InterviewCategory
    label: string
    icon: string
    description: string
}[] = [
    {
        value: "MNC",
        label: "MNC Interview Prep",
        icon: "🏢",
        description: "DSA + System Design + Tech"
    },
    {
        value: "MERN",
        label: "MERN Stack Prep",
        icon: "⚛️",
        description: "JS + React + Node + DSA"
    },
    {
        value: "CollegePlacement",
        label: "College Placement",
        icon: "🎓",
        description: "DSA + Aptitude + Basics"
    },
    {
        value: "DSA",
        label: "DSA Focus",
        icon: "🧠",
        description: "Data Structures & Algorithms"
    },
    {
        value: "SystemDesign",
        label: "System Design",
        icon: "🏗️",
        description: "Architecture & Design"
    },
    {
        value: "GeneralTech",
        label: "General Tech",
        icon: "💻",
        description: "General technical questions"
    }
];
