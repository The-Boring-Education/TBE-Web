import { useAuth } from "@tbe/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

import { RESUME_STEPS } from "@/constants";
import type { UseResumeBuilderReturn } from "@/types/builder";
import type { ResumeStep } from "@/types/resume";

import { useResumeProgress } from "./use-resume-progress";

export const useResumeBuilder = (): UseResumeBuilderReturn => {
  const { session } = useAuth();
  const {
    progress: savedProgress,
    saveProgress,
    isLoading,
  } = useResumeProgress();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<ResumeStep[]>(RESUME_STEPS);
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load saved progress when available
  useEffect(() => {
    if (savedProgress && !isLoading) {
      setStepData(savedProgress.stepData);
      setCurrentStep(savedProgress.currentStep);
      setHasResume(savedProgress.hasResume);
      setShowTemplate(savedProgress.showTemplate);
    }
  }, [savedProgress, isLoading]);

  // Auto-save progress when user is authenticated and data changes
  useEffect(() => {
    if (session && stepData !== RESUME_STEPS) {
      const timeoutId = setTimeout(() => {
        saveProgress({
          stepData,
          currentStep,
          hasResume,
          showTemplate,
        });
      }, 2000); // Debounce save by 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [stepData, currentStep, hasResume, showTemplate, session, saveProgress]);

  const updateChecklistItem = useCallback(
    (stepIndex: number, itemId: string, checked: boolean) => {
      setStepData((prev) =>
        prev.map((step, idx) =>
          idx === stepIndex
            ? {
                ...step,
                checklist: step.checklist.map((item) =>
                  item.id === itemId ? { ...item, checked } : item,
                ),
              }
            : step,
        ),
      );
    },
    [],
  );

  const calculateOverallScore = useCallback(() => {
    const totalItems = stepData.reduce(
      (acc, step) => acc + step.checklist.length,
      0,
    );
    const checkedItems = stepData.reduce(
      (acc, step) => acc + step.checklist.filter((item) => item.checked).length,
      0,
    );
    return Math.round((checkedItems / totalItems) * 100);
  }, [stepData]);

  const calculateStepScore = useCallback(
    (stepIndex: number) => {
      const step = stepData[stepIndex];
      const checkedItems = step.checklist.filter((item) => item.checked).length;
      return Math.round((checkedItems / step.checklist.length) * 100);
    },
    [stepData],
  );

  const resetBuilder = useCallback(() => {
    setStepData(
      RESUME_STEPS.map((step) => ({
        ...step,
        checklist: step.checklist.map((item) => ({
          ...item,
          checked: false,
        })),
      })),
    );
    setCurrentStep(0);
    setShowResult(false);
    setHasResume(null);
    setShowTemplate(false);
  }, []);

  const currentStepData = useMemo(
    () => stepData[currentStep],
    [stepData, currentStep],
  );
  const isLastStep = useMemo(
    () => currentStep === stepData.length - 1,
    [currentStep, stepData],
  );
  const progress = useMemo(
    () => ((currentStep + 1) / stepData.length) * 100,
    [currentStep, stepData],
  );

  return {
    currentStep,
    stepData,
    hasResume,
    showTemplate,
    showResult,
    showConfetti,
    setCurrentStep,
    setStepData,
    setHasResume,
    setShowTemplate,
    setShowResult,
    setShowConfetti,
    updateChecklistItem,
    resetBuilder,
    calculateOverallScore,
    calculateStepScore,
    isLastStep,
    progress,
    currentStepData,
  };
};
