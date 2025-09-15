export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior";
export type GoalType = "3Months" | "6Months" | "1Year";
export type CompanyType = "Startup" | "MidSize" | "MNC" | "FAANG";
export type InterviewCategory =
  | "MNC"
  | "MERN"
  | "CollegePlacement"
  | "DSA"
  | "SystemDesign"
  | "GeneralTech";

export interface OnboardingData {
  linkedInUrl: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  workDomain: string;
  name: string;
  username: string;
  experienceLevel: ExperienceLevel;
  goal: GoalType;
  targetCompanies: CompanyType[];
  preferredCategories: InterviewCategory[];
}