import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/lib/constants';
import { DevRelLead } from '@/lib/database';
import { sendAPIResponse } from '@/lib/utils';
import { connectDB } from '@/middleware';

interface CreateApplicationRequest {
  name: string;
  email: string;
  techStack: string[];
  experienceLevel: string;
  learningFocus: string[];
  availability: string;
  currentRole?: string;
  company?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  portfolioUrl?: string;
  motivation: string;
  previousExperience?: string;
  whyTBE: string;
  commitments: {
    weeklyLearning: boolean;
    communityParticipation: boolean;
    eventAttendance: boolean;
    contentCreation: boolean;
    socialMediaEngagement: boolean;
  };
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: 'Method not allowed',
      })
    );
  }

  try {
    await connectDB();

    const applicationData: CreateApplicationRequest = req.body;

    // Validate required fields
    const requiredFields = [
      'name', 'email', 'techStack', 'experienceLevel', 
      'learningFocus', 'availability', 'motivation', 'whyTBE', 'commitments'
    ];

    const missingFields = requiredFields.filter(field => !applicationData[field as keyof CreateApplicationRequest]);
    
    if (missingFields.length > 0) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        })
      );
    }

    // Check if application already exists
    const existingApplication = await DevRelLead.findByEmail(applicationData.email);
    
    if (existingApplication) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Application already exists for this email address',
        })
      );
    }

    // Create DevRel Lead record
    const devRelLead = await DevRelLead.create({
      name: applicationData.name,
      email: applicationData.email,
      role: 'lead',
      status: 'applied',
      applicationData: {
        techStack: applicationData.techStack,
        experienceLevel: applicationData.experienceLevel,
        learningFocus: applicationData.learningFocus,
        availability: applicationData.availability,
        currentRole: applicationData.currentRole,
        company: applicationData.company,
        linkedinProfile: applicationData.linkedinProfile,
        githubProfile: applicationData.githubProfile,
        portfolioUrl: applicationData.portfolioUrl,
        motivation: applicationData.motivation,
        previousExperience: applicationData.previousExperience,
        whyTBE: applicationData.whyTBE,
      },
      commitments: applicationData.commitments,
      onboardingProgress: {
        isStarted: false,
        completedTasks: [],
        completionPercentage: 0,
      },
      performanceMetrics: {
        tasksCompleted: 0,
        tasksAssigned: 0,
        averageCompletionTime: 0,
        streakCount: 0,
      },
    });

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Application submitted successfully!',
        data: {
          applicationId: devRelLead._id,
          email: applicationData.email,
          status: 'applied',
          submittedAt: devRelLead.createdAt,
        },
      })
    );

  } catch (error) {
    console.error('Error processing application:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        error,
        message: 'Internal server error while processing application',
      })
    );
  }
};

export default handler;