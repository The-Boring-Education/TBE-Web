import type {
  AddJobRequestPayloadProps,
  DatabaseQueryResponseType,
  UnSkilledEvaluationRequestBody,
} from "@/lib/interfaces";
import { constrainNumberToRange } from "@/lib/utils";

import { Job, JobAggregate } from "../models";

// Add A Job
const addJobToDB = async (
  jobPayload: AddJobRequestPayloadProps,
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
  limit = 10,
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
  jobId: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!jobId || typeof jobId !== "string") {
      return { error: "Invalid job ID" };
    }

    const job = await Job.findOne({ job_id: jobId }).lean();

    if (!job) {
      return { error: "Job not found" };
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
        { $unwind: "$skills" },
        { $group: { _id: "$skills", totalJobs: { $sum: 1 } } },
        { $project: { name: "$_id", count: "$totalJobs", _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      const topLocations = await Job.aggregate([
        // Exclude null or empty location arrays
        { $match: { location: { $exists: true, $not: { $size: 0 } } } },

        // Flatten the array: one document per location entry
        { $unwind: "$location" },

        // Clean location strings (optional: trim)
        {
          $project: {
            location: { $trim: { input: "$location" } },
          },
        },

        // Group by cleaned location name
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
          },
        },

        // Rename fields
        {
          $project: {
            name: "$_id",
            count: 1,
            _id: 0,
          },
        },

        // Sort and limit
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      const jobDomains = await Job.aggregate([
        { $unwind: "$role" },
        { $group: { _id: "$role", totalJobs: { $sum: 1 } } },
        { $project: { name: "$_id", count: "$totalJobs", _id: 0 } },
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
                    case: {
                      $lte: ["$company.emp_count", 50],
                    },
                    then: "Startup",
                  },
                  {
                    case: {
                      $and: [
                        {
                          $gt: ["$company.emp_count", 50],
                        },
                        {
                          $lte: ["$company.emp_count", 250],
                        },
                      ],
                    },
                    then: "Mid-Size",
                  },
                  {
                    case: {
                      $gt: ["$company.emp_count", 250],
                    },
                    then: "MNC",
                  },
                ],
                default: "Unknown",
              },
            },
            totalCompanies: { $sum: 1 },
          },
        },
        { $project: { name: "$_id", count: "$totalCompanies", _id: 0 } },
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
        return { error: "Failed to generate job aggregation data" };
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
      return { error: "Failed to save job aggregation to DB" };
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
      return { error: "Failed to fetch latest job aggregation data" };
    }
  };

const getResumeEvaluationResultsFromDB = async ({
  skills,
  domains,
  experience,
}: UnSkilledEvaluationRequestBody): Promise<DatabaseQueryResponseType> => {
  try {
    // Step 1: Filter jobs by domains
    const matchedJobs = await Job.find({
      role: { $in: domains },
      "experience.min": { $lte: experience.max },
      "experience.max": { $gte: experience.min },
    });

    const skillFrequencyMap: Record<string, number> = {};
    const totalJobs = matchedJobs.length;

    let remoteJobCount = 0;

    // Step 2: Count skill frequencies and remote jobs
    matchedJobs.forEach((job) => {
      job.skills.forEach((skill) => {
        const key = skill.trim().toLowerCase();
        skillFrequencyMap[key] = (skillFrequencyMap[key] || 0) + 1;
      });

      if (
        Array.isArray(job.location) &&
        job.location.some((loc) => loc.toLowerCase() === "remote")
      ) {
        remoteJobCount += 1;
      }
    });

    const sortedSkills = Object.entries(skillFrequencyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => {
        const percentage = constrainNumberToRange(
          Math.round((count / totalJobs) * 100),
          0,
          100,
        );
        return {
          skill,
          frequency: count,
          percentage,
        };
      });

    const normalizedUserSkills = skills.map((s) => s.trim().toLowerCase());

    const missingSkills = sortedSkills.filter(
      (s) => !normalizedUserSkills.includes(s.skill),
    );

    const matchedSkills = sortedSkills.filter((s) =>
      normalizedUserSkills.includes(s.skill),
    );

    // Calculate resume score based on skill match strength
    const totalSkillWeight = sortedSkills.reduce(
      (sum, skill) => sum + skill.percentage,
      0,
    );

    const matchedSkillWeight = matchedSkills.reduce(
      (sum, skill) => sum + skill.percentage,
      0,
    );

    // Resume score is the proportion of matched weight vs total weight
    const resumeScore = constrainNumberToRange(
      Math.round((matchedSkillWeight / (totalSkillWeight || 1)) * 100),
      0,
      100,
    );

    // Step 4: Company type breakdown by domain
    const companyTypesAgg = await Job.aggregate([
      {
        $match: {
          role: { $in: domains },
          "experience.min": { $lte: experience.max },
          "experience.max": { $gte: experience.min },
        },
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: { $lte: ["$company.emp_count", 50] },
                  then: "Startup",
                },
                {
                  case: {
                    $and: [
                      { $gt: ["$company.emp_count", 50] },
                      {
                        $lte: ["$company.emp_count", 250],
                      },
                    ],
                  },
                  then: "Mid-Size",
                },
                {
                  case: { $gt: ["$company.emp_count", 250] },
                  then: "MNC",
                },
              ],
              default: "Unknown",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const totalCompanies = companyTypesAgg.reduce(
      (acc, ct) => acc + ct.count,
      0,
    );

    const companyTypeDistribution = companyTypesAgg.map((type) => ({
      name: type.name,
      count: type.count,
      percentage: constrainNumberToRange(
        Math.round((type.count / totalCompanies) * 100),
        0,
        100,
      ),
    }));

    const response = {
      matchedSkills,
      missingSkills,
      resumeScore,
      totalJobsAnalyzed: totalJobs,
      companyTypeDistribution,
      remoteJobs: remoteJobCount,
    };

    return { data: response };
  } catch (error) {
    return { error: "Failed to fetch latest job aggregation data" };
  }
};

export {
  addJobToDB,
  fetchJobsAggregationFromDB,
  getAllJobsFromDB,
  getJobByJobIdFromDB,
  getLatestJobAggregationFromDB,
  getResumeEvaluationResultsFromDB,
  saveDailyJobsAggregationToDB,
};
