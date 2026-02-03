import mongoose from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { EvaluationService } from "../evaluation";

const generateObjectId = () => new mongoose.Types.ObjectId().toString();

describe("EvaluationService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("findById", () => {
    it("returns evaluation by id", async () => {
      const evaluation = await EvaluationService.create({
        name: "Test Evaluation",
        project: generateObjectId(),
        collection: generateObjectId(),
        runs: [],
      });

      const result = await EvaluationService.findById(evaluation._id);

      expect(result).toBeDefined();
      expect(result?._id).toBe(evaluation._id);
      expect(result?.name).toBe("Test Evaluation");
    });

    it("returns null when evaluation not found", async () => {
      const result = await EvaluationService.findById(generateObjectId());

      expect(result).toBeNull();
    });

    it("returns null when id is undefined", async () => {
      const result = await EvaluationService.findById(undefined);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("creates a new evaluation", async () => {
      const projectId = generateObjectId();
      const collectionId = generateObjectId();

      const result = await EvaluationService.create({
        name: "New Evaluation",
        project: projectId,
        collection: collectionId,
        runs: [],
      });

      expect(result._id).toBeDefined();
      expect(result.name).toBe("New Evaluation");
      expect(result.project).toBe(projectId);
      expect(result.collection).toBe(collectionId);
    });

    it("creates evaluation with default export flags", async () => {
      const result = await EvaluationService.create({
        name: "Test Evaluation",
        project: generateObjectId(),
        collection: generateObjectId(),
        runs: [],
      });

      expect(result.isExporting).toBe(false);
      expect(result.hasExportedCSV).toBe(false);
      expect(result.hasExportedJSONL).toBe(false);
    });
  });

  describe("updateById", () => {
    it("updates evaluation by id", async () => {
      const evaluation = await EvaluationService.create({
        name: "Old Name",
        project: generateObjectId(),
        collection: generateObjectId(),
        runs: [],
      });

      const result = await EvaluationService.updateById(evaluation._id, {
        name: "New Name",
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe("New Name");

      const retrieved = await EvaluationService.findById(evaluation._id);
      expect(retrieved?.name).toBe("New Name");
    });

    it("updates export flags", async () => {
      const evaluation = await EvaluationService.create({
        name: "Test Evaluation",
        project: generateObjectId(),
        collection: generateObjectId(),
        runs: [],
      });

      const result = await EvaluationService.updateById(evaluation._id, {
        isExporting: true,
        hasExportedCSV: true,
      });

      expect(result?.isExporting).toBe(true);
      expect(result?.hasExportedCSV).toBe(true);
    });

    it("returns null when evaluation not found", async () => {
      const result = await EvaluationService.updateById(generateObjectId(), {
        name: "New Name",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteById", () => {
    it("deletes evaluation by id", async () => {
      const evaluation = await EvaluationService.create({
        name: "To Delete",
        project: generateObjectId(),
        collection: generateObjectId(),
        runs: [],
      });

      const result = await EvaluationService.deleteById(evaluation._id);

      expect(result).toBeDefined();
      expect(result?._id).toBe(evaluation._id);

      const retrieved = await EvaluationService.findById(evaluation._id);
      expect(retrieved).toBeNull();
    });

    it("returns null when evaluation not found", async () => {
      const result = await EvaluationService.deleteById(generateObjectId());

      expect(result).toBeNull();
    });
  });
});
