/**
 * useResumeEvaluation Hook
 * Handles complete resume evaluation flow with new backend integration
 */

import { resumeEvaluationService } from '@tbe/services';
import type { ResumeEvaluationData } from '@tbe/types';
import { useState } from 'react';

import useResumeParser from './usePDFFile';

const useResumeEvaluation = () => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [evaluationData, setEvaluationData] = useState<ResumeEvaluationData | null>(null);
  const [error, setError] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Use new resume parser hook
  const { file, extractedSkills, handleFileUpload, isLoading: isParsing } = useResumeParser();

  const handleResumeEvaluation = async () => {
    setError('');

    // Validation
    if (!file) {
      setError('Please upload your resume');
      return;
    }

    if (selectedDomains.length === 0) {
      setError('Please select at least one domain');
      return;
    }

    if (selectedDomains.length > 2) {
      setError('Please select maximum 2 domains');
      return;
    }

    if (!selectedExperience) {
      setError('Please select your experience level');
      return;
    }

    if (extractedSkills.length === 0) {
      setError('No skills found in resume. Please upload a valid resume.');
      return;
    }

    try {
      setIsEvaluating(true);

      // Call new backend API
      const response = await resumeEvaluationService.evaluateResume({
        resumeSkills: extractedSkills,
        domains: selectedDomains,
        experienceLevel: selectedExperience,
      });

      if (response.status && response.data) {
        setEvaluationData(response.data);
        setError('');
      } else {
        setError(response.message || 'Evaluation failed');
      }
    } catch (err: any) {
      console.error('Resume evaluation error:', err);
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    // File upload
    file,
    handleFileUpload,
    isParsing,
    
    // Skills extracted
    extractedSkills,
    
    // Domain & experience selection
    selectedDomains,
    setSelectedDomains,
    selectedExperience,
    setSelectedExperience,
    
    // Evaluation
    isEvaluating,
    evaluationData,
    handleResumeEvaluation,
    
    // Error handling
    error,
  };
};

export default useResumeEvaluation;
