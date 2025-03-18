import {
  AddJobRequestPayloadProps,
  DatabaseQueryResponseType,
} from '@/interfaces';
import { Job } from '@/database';

// Add A Job
const addJobToDB = async (
  jobPayload: AddJobRequestPayloadProps
): Promise<DatabaseQueryResponseType> => {
  try {
    const newJob = new Job(jobPayload);
    const savedJob = await newJob.save();
    return { data: savedJob };
  } catch (error) {
    return { error };
  }
};

const getAllJobsFromDB = async (
  query = {},
  page = 1,
  limit = 10
): Promise<DatabaseQueryResponseType> => {
  try {
    const skip = (page - 1) * limit;

    // Fetch paginated data with sorting
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 }) // Sort by latest
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain objects for faster performance

    // Count total jobs matching query (for pagination)
    const total = await Job.countDocuments(query);

    return {
      data: {
        jobs,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
      },
    };
  } catch (error) {
    return { error };
  }
};

const getJobByJobIdFromDB = async (
  jobId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!jobId || typeof jobId !== 'string') {
      return { error: 'Invalid job ID' };
    }

    const job = await Job.findOne({ job_id: jobId }).lean();

    if (!job) {
      return { error: 'Job not found' };
    }
    return { data: job };
  } catch (error) {
    return { error };
  }
};

const getJobsAggregationFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const trendingSkills = await Job.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills', totalJobs: { $sum: 1 } } },
        { $project: { name: '$_id', count: '$totalJobs', _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const topLocations = await Job.aggregate([
        { $match: { location: { $ne: null } } },
        { $group: { _id: '$location', totalJobs: { $sum: 1 } } },
        { $project: { name: '$_id', count: '$totalJobs', _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const jobDomains = await Job.aggregate([
        { $unwind: '$role' },
        { $group: { _id: '$role', totalJobs: { $sum: 1 } } },
        { $project: { name: '$_id', count: '$totalJobs', _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      return {
        data: {
          trendingSkills,
          topLocations,
          jobDomains,
        },
      };
    } catch (error) {
      return { error };
    }
  };

export {
  addJobToDB,
  getAllJobsFromDB,
  getJobByJobIdFromDB,
  getJobsAggregationFromDB,
};
