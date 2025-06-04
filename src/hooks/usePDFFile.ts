import { useState } from 'react';
// import pdfToText from 'react-pdftotext';

// FIXME: Uncomment the pdfToText import when the library is installed and configured correctly
const usePDFFile = () => {
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const extractTextFromPDF = async (file: File) => {
    // pdfToText(file)
    //   .then((text) => {
    //     const extractedSkills = extractSkillsFromText(text);
    //     setExtractedSkills(extractedSkills);
    //   })
    //   .catch((error) =>
    //     console.error('Failed to extract text from pdf', error)
    //   );
    return [];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      extractTextFromPDF(file);
    }
  };

  return { extractedSkills, file, handleFileUpload };
};

export default usePDFFile;
