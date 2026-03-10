import type { ResumeStep } from "./resume";

export interface BuilderState {
  currentStep: number;
  stepData: ResumeStep[];
  hasResume: boolean | null;
  showTemplate: boolean;
  showResult: boolean;
  showConfetti: boolean;
}

export interface BuilderActions {
  setCurrentStep: (step: number) => void;
  setStepData: (data: ResumeStep[]) => void;
  setHasResume: (hasResume: boolean | null) => void;
  setShowTemplate: (show: boolean) => void;
  setShowResult: (show: boolean) => void;
  setShowConfetti: (show: boolean) => void;
  updateChecklistItem: (
    stepIndex: number,
    itemId: string,
    checked: boolean,
  ) => void;
  resetBuilder: () => void;
}

export interface UseResumeBuilderReturn extends BuilderState, BuilderActions {
  calculateOverallScore: () => number;
  calculateStepScore: (stepIndex: number) => number;
  isLastStep: boolean;
  progress: number;
  currentStepData: ResumeStep;
}
