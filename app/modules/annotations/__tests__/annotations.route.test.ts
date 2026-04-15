import fse from "fs-extra";
import { Types } from "mongoose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import "~/storageAdapters/local";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action } from "../containers/annotations.route";

describe("annotations.route action", () => {
  let createdProjectId: string | null = null;

  beforeEach(async () => {
    await clearDocumentDB();
    createdProjectId = null;
  });

  afterEach(async () => {
    if (createdProjectId) {
      await fse.remove(`storage/${createdProjectId}`);
    }
    await fse.remove("tmp/annotation-votes");
  });

  it("returns 404 when the session does not belong to the run", async () => {
    const team = await TeamService.create({ name: "Team" });
    const user = await UserService.create({
      username: "admin",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Project",
      createdBy: user._id,
      team: team._id,
    });
    createdProjectId = project._id;

    const sessionInRunId = new Types.ObjectId().toString();

    const run = await RunService.createFromData({
      project: project._id,
      name: "Run",
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: sessionInRunId,
          name: "in-run.json",
          fileType: "json",
          status: "DONE",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
      snapshot: {
        prompt: {
          name: "Prompt",
          userPrompt: "",
          annotationSchema: [],
          annotationType: "PER_UTTERANCE",
          version: 1,
        },
      },
      isRunning: false,
      isComplete: true,
      hasErrored: false,
      shouldRunVerification: false,
    });

    const session = await SessionService.create({
      name: "session.json",
      project: project._id,
      hasConverted: true,
      hasErrored: false,
    });

    const cookieHeader = await loginUser(user._id);

    const response = await action({
      request: new Request(
        `http://localhost/api/annotations/${run._id}/${session._id}/utterance-1/0`,
        {
          method: "POST",
          headers: {
            cookie: cookieHeader,
            "content-type": "application/json",
          },
          body: JSON.stringify({ markedAs: "UP_VOTED" }),
        },
      ),
      params: {
        runId: run._id,
        sessionId: session._id,
        utteranceId: "utterance-1",
        annotationIndex: "0",
      },
    } as any);

    expect((response as any).init?.status).toBe(404);
    expect((response as any).data).toEqual({
      errors: { general: "Session not found in this run." },
    });
  });

  it("returns success after updating a valid annotation vote", async () => {
    const team = await TeamService.create({ name: "Team" });
    const user = await UserService.create({
      username: "admin",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Project",
      createdBy: user._id,
      team: team._id,
    });
    createdProjectId = project._id;

    const session = await SessionService.create({
      name: "session.json",
      project: project._id,
      hasConverted: true,
      hasErrored: false,
    });

    const run = await RunService.createFromData({
      project: project._id,
      name: "Run",
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session._id,
          name: session.name,
          fileType: "json",
          status: "DONE",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
      snapshot: {
        prompt: {
          name: "Prompt",
          userPrompt: "",
          annotationSchema: [],
          annotationType: "PER_UTTERANCE",
          version: 1,
        },
      },
      isRunning: false,
      isComplete: true,
      hasErrored: false,
      shouldRunVerification: false,
    });

    const storage = getStorageAdapter();
    const sessionPath = `storage/${project._id}/runs/${run._id}/${session._id}/${session.name}`;

    const originalJson = {
      transcript: [
        {
          _id: "utterance-1",
          annotations: [{ _id: "annotation-1", identifiedBy: "model" }],
        },
      ],
      annotations: [],
    };

    const buffer = Buffer.from(JSON.stringify(originalJson));
    await storage.upload({
      file: {
        buffer,
        size: buffer.length,
        type: "application/json",
      },
      uploadPath: sessionPath,
    });

    const cookieHeader = await loginUser(user._id);

    const response = await action({
      request: new Request(
        `http://localhost/api/annotations/${run._id}/${session._id}/utterance-1/0`,
        {
          method: "POST",
          headers: {
            cookie: cookieHeader,
            "content-type": "application/json",
          },
          body: JSON.stringify({ markedAs: "UP_VOTED" }),
        },
      ),
      params: {
        runId: run._id,
        sessionId: session._id,
        utteranceId: "utterance-1",
        annotationIndex: "0",
      },
    } as any);

    expect((response as any).data).toEqual({ success: true });
    expect((response as any).init).toBeNull();

    const uploadedFile = await fse.readJSON(sessionPath);
    expect(uploadedFile.transcript[0].annotations[0].markedAs).toBe("UP_VOTED");
  });
});
