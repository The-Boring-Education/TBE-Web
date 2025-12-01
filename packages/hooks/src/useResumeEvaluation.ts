// hooks/useResumeEvaluation.ts
import { routes } from '@tbe/constants';
import { useApi, usePDFFile } from '@tbe/hooks';
import { useState } from 'react';

// FIXME: REFACTOR
const DUMMY_EVALUATION_DATA = {
  matchedSkills: [
    {
      skill: 'javascript',
      frequency: 467,
      percentage: 45,
    },
    {
      skill: 'mysql',
      frequency: 291,
      percentage: 28,
    },
    {
      skill: 'react.js',
      frequency: 276,
      percentage: 27,
    },
    {
      skill: 'html',
      frequency: 242,
      percentage: 23,
    },
    {
      skill: 'java',
      frequency: 193,
      percentage: 19,
    },
    {
      skill: 'node.js',
      frequency: 172,
      percentage: 17,
    },
    {
      skill: 'css',
      frequency: 165,
      percentage: 16,
    },
    {
      skill: 'python',
      frequency: 143,
      percentage: 14,
    },
    {
      skill: 'git',
      frequency: 136,
      percentage: 13,
    },
    {
      skill: 'php',
      frequency: 133,
      percentage: 13,
    },
    {
      skill: 'mongodb',
      frequency: 101,
      percentage: 10,
    },
    {
      skill: 'postgresql',
      frequency: 88,
      percentage: 9,
    },
  ],
  missingSkills: [
    {
      skill: 'jquery',
      frequency: 180,
      percentage: 17,
    },
    {
      skill: 'angular',
      frequency: 122,
      percentage: 12,
    },
    {
      skill: 'spring boot',
      frequency: 87,
      percentage: 8,
    },
  ],
  resumeScore: 86,
  totalJobsAnalyzed: 1030,
  companyTypeDistribution: [
    {
      name: 'MNC',
      count: 59,
      percentage: 6,
    },
    {
      name: 'Mid-Size',
      count: 27,
      percentage: 3,
    },
    {
      name: 'Startup',
      count: 944,
      percentage: 92,
    },
  ],
  remoteJobs: 89,
};

const useResumeEvaluation = () => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [evaluationData, setEvaluationData] = useState<any>(
    DUMMY_EVALUATION_DATA
  );
  const [error, setError] = useState<string>('');

  const { extractedSkills, file, handleFileUpload } = usePDFFile();

  const { makeRequest, loading: isEvaluating } = useApi('evaluateResume');

  const handleResumeEvaluation = async () => {
    setError('');

    if (!file || selectedDomains.length === 0 || !selectedExperience) {
      setError('Please upload resume, select domain and experience');
      return;
    }

    try {
      const response = await makeRequest({
        method: 'POST',
        url: `${routes.api.unskilledEvaluation}`,
        body: {
          skills: extractedSkills,
          domains: selectedDomains,
          experience: { min: 0, max: parseInt(selectedExperience) || 2 },
        },
      });

      setEvaluationData(response.data);
    } catch (err) {
      setError('Evaluation failed. Please try again.');
    }
  };

  return {
    file,
    handleFileUpload,
    selectedDomains,
    setSelectedDomains,
    selectedExperience,
    setSelectedExperience,
    isEvaluating,
    evaluationData,
    handleResumeEvaluation,
    error,
  };
};

export default useResumeEvaluation;
