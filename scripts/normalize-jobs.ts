import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '@/database/models/Unskilled/Jobs';
import {
  JOB_SKILL_NORMALIZER,
  JOB_LOCATION_NORMALIZER,
  JOB_DOMAIN_NORMALIZER,
} from '../src/constant';
import { normalizeAPIPayload } from '../src/utils/functions';

dotenv.config({ path: '.env.local' });

const normalizeJobs = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('HERE', process.env.MONGODB_URI);

  const BATCH_SIZE = 1000;
  let page = 0;
  let updatedCount = 0;

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

normalizeJobs();
