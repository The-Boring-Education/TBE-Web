// hooks/useResumeEvaluation.ts
import { useState } from 'react';
import { usePDFFile, useApi } from '@/hooks';
import { routes } from '@/constant';

const useResumeEvaluation = () => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [evaluationData, setEvaluationData] = useState<any>(null);

  const { extractedSkills, file, handleFileUpload } = usePDFFile();

  const { makeRequest, loading: isEvaluating } = useApi('evaluateResume');

  const handleResumeEvaluation = async () => {
    if (!file || selectedDomains.length === 0 || !selectedExperience) {
      alert('Please upload resume, select domain and experience');
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
      console.error('Evaluation failed:', err);
      alert('Evaluation failed. Please try again.');
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
  };
};

export default useResumeEvaluation;
