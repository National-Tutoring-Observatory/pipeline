import { beforeEach, describe, expect, it, vi } from "vitest";
import "~/modules/documents/documents";
import createRunAnnotations from "../services/createRunAnnotations.server";
import { RunService } from "~/modules/runs/run";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { PromptService } from "~/modules/prompts/prompt";
import { ProjectService } from "../project";
import { TeamService } from "~/modules/teams/team";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';

describe("createRunAnnotations", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("throws error if project not found", async () => {
    const team = await TeamService.create({ name: "team 1" });
    const prompt = await PromptService.create({
      name: "Test Prompt",
      annotationType: "PER_UTTERANCE",
      team: team._id
    });

    // Create a run with a non-existent project ID
    const invalidProjectId = "507f1f77bcf86cd799439011"; // Valid ObjectId format but doesn't exist
    const run = await RunService.create({
      name: "Test Run",
      project: invalidProjectId as any,
      annotationType: "PER_UTTERANCE",
      prompt: prompt._id,
      promptVersion: 1,
      model: "gpt-4",
      sessions: [],
      hasSetup: true,
      isRunning: false,
      isComplete: false,
      hasErrored: false,
      isExporting: false,
      hasExportedCSV: false,
      hasExportedJSONL: false
    });

    await expect(createRunAnnotations(run)).rejects.toThrow(
      `Project not found: ${invalidProjectId}`
    );
  });

  it("throws error if prompt version not found", async () => {
    const team = await TeamService.create({ name: "team 1" });
    const project = await ProjectService.create({
      name: "Test Project",
      team: team._id
    });

    const prompt = await PromptService.create({
      name: "Test Prompt",
      annotationType: "PER_UTTERANCE",
      team: team._id
    });

    const run = await RunService.create({
      name: "Test Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      prompt: prompt._id,
      promptVersion: 1,
      model: "gpt-4",
      sessions: [],
      hasSetup: true,
      isRunning: false,
      isComplete: false,
      hasErrored: false,
      isExporting: false,
      hasExportedCSV: false,
      hasExportedJSONL: false
    });

    await expect(createRunAnnotations(run)).rejects.toThrow(
      "Prompt version not found"
    );
  });

  it("returns early if run is already running", async () => {
    const team = await TeamService.create({ name: "team 1" });
    const project = await ProjectService.create({
      name: "Test Project",
      team: team._id
    });

    const prompt = await PromptService.create({
      name: "Test Prompt",
      annotationType: "PER_UTTERANCE",
      team: team._id
    });

    const run = await RunService.create({
      name: "Test Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      prompt: prompt._id,
      promptVersion: 1,
      model: "gpt-4",
      sessions: [],
      hasSetup: true,
      isRunning: true,
      isComplete: false,
      hasErrored: false,
      isExporting: false,
      hasExportedCSV: false,
      hasExportedJSONL: false
    });

    // Should not throw, should return early
    await expect(createRunAnnotations(run)).resolves.toBeUndefined();
  });

  it("successfully processes a run with valid data", async () => {
    const team = await TeamService.create({ name: "team 1" });
    const project = await ProjectService.create({
      name: "Test Project",
      team: team._id
    });

    const prompt = await PromptService.create({
      name: "Test Prompt",
      annotationType: "PER_UTTERANCE",
      team: team._id
    });

    const promptVersion = await PromptVersionService.create({
      name: "Version 1",
      prompt: prompt._id,
      version: 1,
      userPrompt: "Analyze this",
      annotationSchema: [
        {
          isSystem: true,
          fieldKey: "_id",
          fieldType: "string",
          value: ""
        }
      ]
    });

    const run = await RunService.create({
      name: "Test Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      prompt: prompt._id,
      promptVersion: 1,
      model: "gpt-4",
      sessions: [],
      hasSetup: true,
      isRunning: false,
      isComplete: false,
      hasErrored: false,
      isExporting: false,
      hasExportedCSV: false,
      hasExportedJSONL: false
    });

    // Mock TaskSequencer to avoid actual task queueing
    vi.doMock("~/modules/queues/helpers/taskSequencer");

    // Should process without error
    await expect(createRunAnnotations(run)).resolves.toBeUndefined();
  });
});
