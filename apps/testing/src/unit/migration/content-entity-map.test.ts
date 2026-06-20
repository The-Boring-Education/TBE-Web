/**
 * Guards `CONTENT_ENTITY_MAP` against drift when new `applyContentIdOnCreate` models are added.
 */
import AptitudeTopic from "@api/lib/database/models/InterviewPrep/AptitudeTopic";
import CoreSubject from "@api/lib/database/models/InterviewPrep/CoreSubject";
import DSAQuestion from "@api/lib/database/models/InterviewPrep/DSAQuestion";
import InterviewSheet from "@api/lib/database/models/InterviewPrep/Sheet";
import StudyGuide from "@api/lib/database/models/InterviewPrep/StudyGuide";
import Project from "@api/lib/database/models/Project";
import Quiz from "@api/lib/database/models/Quiz/Quiz";
import Course from "@api/lib/database/models/Shiksha/Course";
import { CONTENT_ENTITY_MAP } from "@api/lib/migration/content-entity-map";
import type { Model } from "mongoose";
import { describe, expect, it } from "vitest";

const CONTENT_ID_MODELS: Model<unknown>[] = [
  InterviewSheet,
  DSAQuestion,
  StudyGuide,
  AptitudeTopic,
  CoreSubject,
  Course,
  Project,
  Quiz,
];

describe("CONTENT_ENTITY_MAP", () => {
  it("includes every Mongoose model that uses applyContentIdOnCreate", () => {
    const mapCollections = new Set(Object.values(CONTENT_ENTITY_MAP));
    const modelCollections = CONTENT_ID_MODELS.map(
      (model) => model.collection.collectionName,
    );

    for (const collection of modelCollections) {
      expect(mapCollections.has(collection)).toBe(true);
    }

    expect(mapCollections.size).toBe(modelCollections.length);
  });
});
