import type { NextApiRequest, NextApiResponse } from 'next';

import {
  apiStatusCodes,
  JOB_DOMAIN_NORMALIZER,
  JOB_LOCATION_NORMALIZER,
  JOB_SKILL_NORMALIZER,
} from '@/lib/constants';
import { addJobToDB, getAllJobsFromDB, getJobByJobIdFromDB } from '@/lib/database';
import type { AddJobRequestPayloadProps } from '@/lib/interfaces';
import { connectDB } from '@/middleware';
import {
  cleanJobSkillsData,
  normalizeAPIPayload,
  sendAPIResponse,
} from '@/lib/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  switch (req.method) {
    case 'POST':
      return handleAddJob(req, res);
    case 'GET':
      return handleGetJobs(req, res);
    default:
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Method ${req.method} not allowed`,
      });
  }
};

const handleAddJob = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const jobPayload = req.body as AddJobRequestPayloadProps;
    const {
      job_id,
      job_title,
      job_description,
      company,
      skills,
      role,
      location,
      experience,
      jobUrl,
      salary,
      platform,
    } = jobPayload;

    if (
      !job_id ||
      !job_title ||
      !job_description ||
      !role?.length ||
      !location ||
      !jobUrl ||
      !platform ||
      !skills?.length
    ) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Missing required job details',
      });
    }

    const { data: existingJob } = await getJobByJobIdFromDB(job_id);
    if (existingJob) {
      return res.status(apiStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Job already exists',
      });
    }

    // Normalize the skills array
    const cleanedSkills = cleanJobSkillsData(skills);
    const normalisedSkills = normalizeAPIPayload(
      cleanedSkills,
      JOB_SKILL_NORMALIZER
    );
    const cleanedLocations = normalizeAPIPayload(
      location,
      JOB_LOCATION_NORMALIZER
    );
    const cleanedRole = normalizeAPIPayload(role, JOB_DOMAIN_NORMALIZER);

    const { error, data: newJob } = await addJobToDB({
      job_id,
      job_title,
      job_description,
      company,
      skills: normalisedSkills as string[],
      role: cleanedRole as string[],
      location: cleanedLocations as string[],
      experience,
      jobUrl,
      salary,
      platform,
    });

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to add job',
          error,
        })
      );
    }

    return res.status(apiStatusCodes.RESOURCE_CREATED).json(
      sendAPIResponse({
        status: true,
        message: 'Job added successfully!',
        data: newJob,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'An unexpected error occurred while adding the job',
      error,
    });
  }
};



const handleGetJobs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { page = '1', limit = '10', role, location, skills } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    const query: any = {};

    if (role) query.role = new RegExp(role as string, 'i');
    if (location) query.location = new RegExp(location as string, 'i');
    if (skills) query.skills = { $in: (skills as string).split(',') };

    const { data, error } = await getAllJobsFromDB(query, pageNumber, pageSize);

    if (error) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error fetching jobs',
        error,
      });
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Jobs fetched successfully',
        data,
      })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'An unexpected error occurred while fetching jobs',
      error,
    });
  }
};

export default handler;
