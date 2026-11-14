/**
 * Integration tests for the `completionTracking → Contribution` migration
 * (in-memory MongoDB).
 */
import { Contribution } from "@api/lib/database/models/DevRel/Contribution";
import { DevRelLead } from "@api/lib/database/models/DevRel/DevRelLead";
import { DevRelTask } from "@api/lib/database/models/DevRel/DevRelTask";
import User from "@api/lib/database/models/User";
import { migrateCompletionTrackingToContributions } from "@api/lib/migration/devrel-contributions";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const leadPayload = (email: string) => ({
  name: "Lead",
  email,
  applicationData: {
    techStack: ["React"],
    experienceLevel: "Beginner",
    learningFocus: ["Frontend Development"],
    availability: "5-10 hours/week",
    motivation: "Learn in public",
    whyTBE: "Community",
  },
  commitments: {
    weeklyLearning: true,
    communityParticipation: true,
    eventAttendance: true,
    contentCreation: true,
    socialMediaEngagement: true,
  },
});

describe("migrateCompletionTrackingToContributions (integration)", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(`${mongod.getUri()}devrel_migration`);
  }, 180_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  }, 30_000);

  beforeEach(async () => {
    await Promise.all([
      Contribution.deleteMany({}),
      DevRelTask.deleteMany({}),
      DevRelLead.deleteMany({}),
      User.deleteMany({}),
    ]);
  });

  const seed = async () => {
    const user = await User.create({
      name: "Asha",
      email: "asha@example.com",
    });
    const lead = await DevRelLead.create(leadPayload("asha@example.com"));
    const task = await DevRelTask.create({
      title: "Fix the docs",
      description: "Docs need love",
      type: "weekly",
      track: "code",
      pointsReward: 20,
      createdBy: user._id,
      completionTracking: new Map<string, unknown>([
        [
          String(lead._id),
          {
            status: "completed",
            reviewStatus: "approved",
            submissionUrl: "https://github.com/org/repo/pull/7",
            notes: "Merged",
          },
        ],
      ]),
    });

    return { user, lead, task };
  };

  it("reports what it would write without touching the ledger (dry run)", async () => {
    await seed();

    const result = await migrateCompletionTrackingToContributions({
      dryRun: true,
      verbose: false,
    });

    expect(result).toMatchObject({
      tasksScanned: 1,
      entriesScanned: 1,
      created: 1,
      dropped: 0,
      skippedExisting: 0,
      skippedUnresolved: 0,
      errors: 0,
    });
    expect(await Contribution.countDocuments()).toBe(0);
  });

  it("writes approved contributions with the task's points", async () => {
    const { lead, task } = await seed();

    await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    const contribution = await Contribution.findOne({ leadId: lead._id });
    expect(contribution).toMatchObject({
      status: "approved",
      pointsAwarded: 20,
      proofKind: "github_pr",
      proofUrl: "https://github.com/org/repo/pull/7",
      track: "code",
      notes: "Merged",
    });
    expect(String(contribution?.taskId)).toBe(String(task._id));
  });

  it("is idempotent across reruns", async () => {
    await seed();

    await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });
    const second = await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    expect(second.created).toBe(0);
    expect(second.skippedExisting).toBe(1);
    expect(await Contribution.countDocuments()).toBe(1);
  });

  it("drops untouched entries and maps the reviewed ones", async () => {
    const user = await User.create({ name: "Bo", email: "bo@example.com" });
    const lead = await DevRelLead.create(leadPayload("bo@example.com"));
    const otherLead = await DevRelLead.create(leadPayload("cy@example.com"));
    await DevRelTask.create({
      title: "Write a blog",
      description: "Share your learnings",
      type: "weekly",
      track: "community",
      pointsReward: 15,
      createdBy: user._id,
      completionTracking: new Map<string, unknown>([
        [String(lead._id), { status: "in_progress" }],
        [
          String(otherLead._id),
          { status: "pending", submissionUrl: "https://blog.example.com/a" },
        ],
      ]),
    });

    const result = await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    expect(result).toMatchObject({
      entriesScanned: 2,
      created: 1,
      dropped: 1,
      skippedUnresolved: 0,
    });

    const contribution = await Contribution.findOne({ leadId: lead._id });
    expect(contribution).toMatchObject({
      status: "pending",
      pointsAwarded: 0,
      track: "community",
      proofKind: "other",
    });
    expect(contribution?.proofUrl).toContain("legacy://devrel-task/");
  });

  it("skips entries whose lead has no matching user", async () => {
    const creator = await User.create({
      name: "Admin",
      email: "admin@example.com",
    });
    const lead = await DevRelLead.create(leadPayload("ghost@example.com"));
    await DevRelTask.create({
      title: "Host an event",
      description: "Community meetup",
      type: "special",
      pointsReward: 5,
      createdBy: creator._id,
      completionTracking: new Map<string, unknown>([
        [String(lead._id), { status: "completed", reviewStatus: "approved" }],
      ]),
    });

    const result = await migrateCompletionTrackingToContributions({
      dryRun: false,
      verbose: false,
    });

    expect(result.skippedUnresolved).toBe(1);
    expect(result.created).toBe(0);
    expect(await Contribution.countDocuments()).toBe(0);
  });
});
