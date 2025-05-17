import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '@/database/models/Unskilled/Jobs';
import {
  JOB_SKILL_NORMALIZER,
  JOB_LOCATION_NORMALIZER,
  JOB_DOMAIN_NORMALIZER,
  JOB_DOMAIN_MAPPER,
} from '../src/constant';
import {
  cleanJobSkillsData,
  normalizeAPIPayload,
} from '../src/utils/functions';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const BATCH_SIZE = 1000;
let page = 0;
let updatedCount = 0;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for domain updates');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

const normalizeJobs = async () => {
  await connectDB();
  console.log('Starting job normalization...');

  while (true) {
    const jobs = await Job.find({})
      .skip(page * BATCH_SIZE)
      .limit(BATCH_SIZE);

    if (jobs.length === 0) break;

    const updates = jobs.map(async (job) => {
      const skills = normalizeAPIPayload(job.skills, JOB_SKILL_NORMALIZER);
      const location = normalizeAPIPayload(
        job.location,
        JOB_LOCATION_NORMALIZER
      );
      const role = normalizeAPIPayload(job.role, JOB_DOMAIN_NORMALIZER);

      await Job.findByIdAndUpdate(job._id, {
        skills,
        location,
        role,
      });
    });

    await Promise.all(updates);
    updatedCount += jobs.length;
    console.log(`✅ Normalized ${updatedCount} jobs so far...`);

    page++;
  }

  console.log('🎉 All jobs normalized successfully');
  process.exit(0);
};

const addDomainsBasedOnSkills = async () => {
  await connectDB();
  console.log('Starting domain mapping...');

  while (true) {
    const jobs = await Job.find({})
      .skip(page * BATCH_SIZE)
      .limit(BATCH_SIZE);

    if (jobs.length === 0) break;

    const updates = jobs.map(async (job) => {
      const jobSkills = job.skills.map((s) => s.toLowerCase().trim());
      const currentRoles = job.role || [];
      let newRoles: Set<string> = new Set(currentRoles);

      for (const mapping of JOB_DOMAIN_MAPPER) {
        const matched = mapping.skills.some((skill) =>
          jobSkills.includes(skill.toLowerCase())
        );

        if (matched) {
          mapping.domain.forEach((domain) => newRoles.add(domain));
        }
      }

      await Job.findByIdAndUpdate(job._id, {
        role: Array.from(newRoles),
      });
    });

    await Promise.all(updates);
    updatedCount += jobs.length;
    console.log(`✅ Domain-updated ${updatedCount} jobs so far...`);

    page++;
  }

  console.log('🎉 All job roles updated with domain mapping successfully');
  process.exit(0);
};

// Get All Job Skills (Top 300 by frequency, using aggregation)
const getAllJobSkills = async () => {
  await connectDB();
  console.log('Fetching top 300 job skills using aggregation...');

  const topSkills = await Job.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: { $trim: { input: '$skills' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 500 },
  ]);

  const skillList = topSkills.map((item) => item._id);

  const filePath = path.resolve(process.cwd(), 'top_skills.json');
  fs.writeFileSync(filePath, JSON.stringify(skillList, null, 2), 'utf-8');

  console.log(`✅ Top 300 job skills written to ${filePath}`);
  process.exit(0);
};

const cleanJobSkills = async () => {
  await connectDB();

  const BATCH_SIZE = 1000;
  let page = 0;

  while (true) {
    const jobs = await Job.find({})
      .skip(page * BATCH_SIZE)
      .limit(BATCH_SIZE);

    if (jobs.length === 0) break;

    const updates = jobs.map(async (job) => {
      const cleanedSkills = cleanJobSkillsData(job.skills || []);
      await Job.findByIdAndUpdate(job._id, { skills: cleanedSkills });
    });

    await Promise.all(updates);
    console.log(`Cleaned batch: ${page + 1}`);
    page++;
  }

  console.log('✅ Skill cleanup complete');
};

normalizeJobs();
addDomainsBasedOnSkills();
// getAllJobSkills();
// cleanJobSkills();
