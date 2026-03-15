export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ResumeExample {
  good: string;
  bad: string;
  reasoning: string;
}

export type AudienceType = "general" | "tech" | "students" | "professionals";

export interface ResumeStep {
  id: string;
  title: string;
  description: string;
  audience: string;
  audienceType: AudienceType;
  importance: string;
  recruitersPoV: string;
  proTips: string[];
  checklist: ChecklistItem[];
  examples: ResumeExample;
}

export interface ResumeProgress {
  userId: string;
  stepData: ResumeStep[];
  currentStep: number;
  overallScore: number;
  hasResume: boolean | null;
  showTemplate: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export interface SaveProgressRequest {
  stepData: ResumeStep[];
  currentStep: number;
  hasResume: boolean | null;
  showTemplate: boolean;
}

export interface SaveProgressResponse {
  success: boolean;
  message: string;
  progress?: ResumeProgress;
}

export interface GetProgressResponse {
  success: boolean;
  progress?: ResumeProgress;
  message?: string;
}
