/**
 * Resume Parser API Route
 * Parses PDF/DOCX resume files and extracts skills only
 * Follows TBE pattern: Frontend calls this, then sends data to Unskilled backend
 */

import { JOB_SKILL_NORMALIZER } from '@tbe/constants';
import type { ParseResumeResponse } from '@tbe/types';
import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';
import type { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';

// Disable body parser to handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Extract skills from text using JOB_SKILL_NORMALIZER
 * Enhanced with word boundary detection and variations
 */
const extractSkillsFromText = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const matchedSkills = new Set<string>();

  JOB_SKILL_NORMALIZER.forEach(({ label, value }) => {
    const labelArray = Array.isArray(label) ? label : [label];
    
    for (const skillVariant of labelArray) {
      const skillLower = skillVariant.toLowerCase();
      
      // Create word boundary pattern for accurate matching
      // Matches: "React", "React.js", "React JS", but not "Reactionary"
      const wordBoundaryPattern = new RegExp(
        `\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b|` +
        `\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.js\\b|` +
        `\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} js\\b`,
        'i'
      );
      
      if (wordBoundaryPattern.test(lowerText)) {
        matchedSkills.add(value);
        break; // Found this skill, move to next
      }
    }
  });

  return Array.from(matchedSkills);
};

/**
 * Parse PDF file and extract text
 */
const parsePDF = async (filePath: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

/**
 * Parse DOCX file and extract text
 */
const parseDOCX = async (filePath: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  return result.value;
};

/**
 * Parse resume file based on type
 */
const parseResumeFile = async (file: formidable.File): Promise<string> => {
  const filePath = file.filepath;
  const mimeType = file.mimetype || '';

  if (mimeType === 'application/pdf') {
    return await parsePDF(filePath);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return await parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file type. Please upload PDF or DOCX.');
  }
};

/**
 * Main API handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParseResumeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: false,
      message: 'Method not allowed',
    });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB max
      keepExtensions: true,
    });

    const [_fields, files] = await form.parse(req);
    const resumeFile = files.resume?.[0];

    if (!resumeFile) {
      return res.status(400).json({
        status: false,
        message: 'No resume file provided',
      });
    }

    // Extract text from resume
    const resumeText = await parseResumeFile(resumeFile);

    // Extract skills using normalizer
    const skills = extractSkillsFromText(resumeText);

    // Clean up temporary file
    try {
      fs.unlinkSync(resumeFile.filepath);
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }

    return res.status(200).json({
      status: true,
      message: 'Resume parsed successfully',
      data: {
        skills,
      },
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to parse resume',
      error: error.stack || error.toString(),
    });
  }
}
