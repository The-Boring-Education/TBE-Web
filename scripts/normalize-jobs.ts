import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '@/database/models/Unskilled/Jobs';
import {
  JOB_SKILL_NORMALIZER,
  JOB_LOCATION_NORMALIZER,
  JOB_DOMAIN_NORMALIZER,
  JOB_DOMAIN_MAPPER,
  envConfig,
} from '../src/constant';
import {
  cleanJobSkillsData,
  normalizeAPIPayload,
} from '../src/utils/functions';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

class JobNormalizer {
  private BATCH_SIZE = 1000;
  private page = 0;
  private updatedCount = 0;

  async connectDB() {
    try {
      await mongoose.connect(envConfig.MONGODB_URI as string);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  deduplicateArray = (arr: string[]): string[] => {
    return Array.from(new Set(arr.map((item) => item.trim())));
  };

  async normalizeJobs() {
    await this.connectDB();
    console.log('Starting job normalization...');

    while (true) {
      const jobs = await Job.find({})
        .skip(this.page * this.BATCH_SIZE)
        .limit(this.BATCH_SIZE);

      if (jobs.length === 0) break;

      const updates = jobs.map(async (job) => {
        const skills = normalizeAPIPayload(job.skills, JOB_SKILL_NORMALIZER);
        const location = normalizeAPIPayload(
          job.location,
          JOB_LOCATION_NORMALIZER
        );
        const role = normalizeAPIPayload(job.role, JOB_DOMAIN_NORMALIZER);

        await Job.findByIdAndUpdate(
          job._id,
          {
            skills: this.deduplicateArray(
              Array.from(job.skills || []).concat(Array.from(skills || []))
            ),
            location: this.deduplicateArray(
              Array.from(job.location || []).concat(Array.from(location || []))
            ),
            role: this.deduplicateArray(
              Array.from(job.role || []).concat(Array.from(role || []))
            ),
          },
          { new: true }
        );
      });

      await Promise.all(updates);
      this.updatedCount += jobs.length;
      console.log(`✅ Normalized ${this.updatedCount} jobs so far...`);

      this.page++;
    }

    console.log('🎉 All jobs normalized successfully');
  }

  async addDomainsBasedOnSkills() {
    await this.connectDB();
    console.log('Starting domain mapping...');

    while (true) {
      const jobs = await Job.find({})
        .skip(this.page * this.BATCH_SIZE)
        .limit(this.BATCH_SIZE);

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
      this.updatedCount += jobs.length;
      console.log(`✅ Domain-updated ${this.updatedCount} jobs so far...`);

      this.page++;
    }

    console.log('🎉 All job roles updated with domain mapping successfully');
  }

  async getAllJobSkills() {
    await this.connectDB();
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
  }

  async cleanJobSkills() {
    await this.connectDB();

    while (true) {
      const jobs = await Job.find({})
        .skip(this.page * this.BATCH_SIZE)
        .limit(this.BATCH_SIZE);

      if (jobs.length === 0) break;

      const updates = jobs.map(async (job) => {
        const cleanedSkills = cleanJobSkillsData(job.skills || []);
        await Job.findByIdAndUpdate(job._id, { skills: cleanedSkills });
      });

      await Promise.all(updates);
      console.log(`Cleaned batch: ${this.page + 1}`);
      this.page++;
    }

    console.log('✅ Skill cleanup complete');
  }

  async deduplicateAllJobFields() {
    await this.connectDB();
    console.log('🔄 Starting deduplication in batches...');

    while (true) {
      const jobs = await Job.find({})
        .skip(this.page * this.BATCH_SIZE)
        .limit(this.BATCH_SIZE)
        .select('_id');

      if (jobs.length === 0) break;

      const updates = jobs.map((job) =>
        Job.updateOne({ _id: job._id }, [
          {
            $set: {
              skills: {
                $setUnion: [
                  {
                    $filter: {
                      input: '$skills',
                      as: 'item',
                      cond: {
                        $ne: [{ $trim: { input: '$$item' } }, ''],
                      },
                    },
                  },
                  [],
                ],
              },
              location: {
                $setUnion: [
                  {
                    $filter: {
                      input: '$location',
                      as: 'item',
                      cond: {
                        $ne: [{ $trim: { input: '$$item' } }, ''],
                      },
                    },
                  },
                  [],
                ],
              },
              role: {
                $setUnion: [
                  {
                    $filter: {
                      input: '$role',
                      as: 'item',
                      cond: {
                        $ne: [{ $trim: { input: '$$item' } }, ''],
                      },
                    },
                  },
                  [],
                ],
              },
            },
          },
        ])
      );

      const results = await Promise.all(updates);
      const modified = results.filter((res) => res.modifiedCount > 0).length;

      this.updatedCount += jobs.length;
      console.log(
        `✅ Batch ${this.page + 1}: Processed ${
          jobs.length
        } jobs, Modified: ${modified}`
      );

      this.page++;
    }

    console.log('🎉 All jobs deduplicated successfully');
  }

  async removeSkillsWithLowercaseStart() {
    await this.connectDB();
    console.log('🧹 Removing lowercase-starting skills...');

    while (true) {
      const jobs = await Job.find({})
        .skip(this.page * this.BATCH_SIZE)
        .limit(this.BATCH_SIZE);

      if (jobs.length === 0) break;

      const updates = jobs.map(async (job) => {
        const cleanedSkills = (job.skills || []).filter(
          (skill) => skill && /^[A-Z]/.test(skill.trim())
        );

        if (cleanedSkills.length === 0) {
          await Job.findByIdAndDelete(job._id);
          console.log(`🗑️ Deleted job ${job._id} due to no valid skills`);
        } else {
          await Job.findByIdAndUpdate(job._id, {
            skills: cleanedSkills,
          });
        }
      });

      await Promise.all(updates);
      console.log(`✅ Batch ${this.page + 1} lowercase-skill filter complete`);
      this.page++;
    }

    console.log('🎉 All lowercase-starting skills removed and cleaned');
  }
}

const init = async () => {
  const jobNormalizer = new JobNormalizer();
  // await jobNormalizer.normalizeJobs();
  // await jobNormalizer.addDomainsBasedOnSkills();
  // await jobNormalizer.getAllJobSkills();
  // await jobNormalizer.deduplicateAllJobFields();
  // await jobNormalizer.cleanJobSkills();
  await jobNormalizer.removeSkillsWithLowercaseStart();
};

init();
