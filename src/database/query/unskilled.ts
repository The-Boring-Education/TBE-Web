import {
  AddJobRequestPayloadProps,
  DatabaseQueryResponseType,
} from '@/interfaces';
import { Job, JobAggregate } from '@/database';
import { normalizeAPIPayload } from '@/utils';
import {
  JOB_DOMAIN_NORMALIZER,
  JOB_LOCATION_NORMALIZER,
  JOB_SKILL_NORMALIZER,
} from '@/constant';

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

const fetchJobsAggregationFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const trendingSkills = await Job.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills', totalJobs: { $sum: 1 } } },
        { $project: { name: '$_id', count: '$totalJobs', _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      const topLocations = await Job.aggregate([
        // Exclude null or empty location arrays
        { $match: { location: { $exists: true, $not: { $size: 0 } } } },

        // Flatten the array: one document per location entry
        { $unwind: '$location' },

        // Clean location strings (optional: trim)
        {
          $project: {
            location: { $trim: { input: '$location' } },
          },
        },

        // Group by cleaned location name
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 },
          },
        },

        // Rename fields
        {
          $project: {
            name: '$_id',
            count: 1,
            _id: 0,
          },
        },

        // Sort and limit
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      const jobDomains = await Job.aggregate([
        { $unwind: '$role' },
        { $group: { _id: '$role', totalJobs: { $sum: 1 } } },
        { $project: { name: '$_id', count: '$totalJobs', _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      const companyTypes = await Job.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  {
                    case: { $lte: ['$company.emp_count', 50] },
                    then: 'Startup',
                  },
                  {
                    case: {
                      $and: [
                        { $gt: ['$company.emp_count', 50] },
                        { $lte: ['$company.emp_count', 250] },
                      ],
                    },
                    then: 'Mid-Size',
                  },
                  {
                    case: { $gt: ['$company.emp_count', 250] },
                    then: 'MNC',
                  },
                ],
                default: 'Unknown',
              },
            },
            totalCompanies: { $sum: 1 },
          },
        },
        { $project: { name: '$_id', count: '$totalCompanies', _id: 0 } },
      ]);

      return {
        data: {
          trendingSkills,
          topLocations,
          jobDomains,
          companyTypes,
        },
      };
    } catch (error) {
      return { error };
    }
  };

const saveDailyJobsAggregationToDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      // Step 1: Get Aggregated Data
      const { data, error } = await fetchJobsAggregationFromDB();

      if (error || !data) {
        return { error: 'Failed to generate job aggregation data' };
      }

      // Step 2: Create a new JobAggregate document
      const newAggregation = new JobAggregate({
        trendingSkills: data.trendingSkills,
        topLocations: data.topLocations,
        jobDomains: data.jobDomains,
        companyTypes: data.companyTypes,
      });

      await newAggregation.save();

      return { data: newAggregation };
    } catch (error) {
      return { error: 'Failed to save job aggregation to DB' };
    }
  };

const getLatestJobAggregationFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const latestAggregation = await JobAggregate.findOne()
        .sort({ createdAt: -1 })
        .lean();

      if (!latestAggregation) {
        return { data: null };
      }

      return { data: latestAggregation };
    } catch (error) {
      return { error: 'Failed to fetch latest job aggregation data' };
    }
  };

export {
  addJobToDB,
  getAllJobsFromDB,
  getJobByJobIdFromDB,
  fetchJobsAggregationFromDB,
  saveDailyJobsAggregationToDB,
  getLatestJobAggregationFromDB,
};
