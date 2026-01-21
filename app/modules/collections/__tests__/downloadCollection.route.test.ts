import fse from "fs-extra";
import { Types } from "mongoose";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CollectionService } from "~/modules/collections/collection";
import type { Collection } from "~/modules/collections/collections.types";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import { ProjectService } from "~/modules/projects/project";
import type { Project } from "~/modules/projects/projects.types";
import { RunService } from "~/modules/runs/run";
import type { Run } from "~/modules/runs/runs.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import "~/modules/storage/storage";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/downloadCollection.route";

describe("downloadCollection.route loader", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let collection: Collection;
  let run: Run;
  let cookieHeader: string;
  let storage: ReturnType<typeof getStorageAdapter>;

  beforeEach(async () => {
    await clearDocumentDB();

    await FeatureFlagService.create({ name: "HAS_PROJECT_COLLECTIONS" });
    user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    run = await RunService.create({
      name: "Test Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      isRunning: false,
      isComplete: true,
    });
    collection = await CollectionService.create({
      name: "Test Collection",
      project: project._id,
      sessions: [],
      runs: [run._id],
      annotationType: "PER_UTTERANCE",
    });

    cookieHeader = await loginUser(user._id);
    storage = getStorageAdapter();
  });

  afterEach(async () => {
    await fse.remove(`storage/${project._id}`);
  });

  async function uploadFakeExportFiles(
    col: Collection,
    exportType: "CSV" | "JSONL",
  ) {
    const outputDirectory = `storage/${col.project}/collections/${col._id}/exports`;

    if (exportType === "CSV") {
      const metaCsv = Buffer.from("runId,runName\n123,Test Run");
      const utterancesCsv = Buffer.from(
        "sessionId,utteranceId,text\n1,1,Hello",
      );

      await storage.upload({
        file: { buffer: metaCsv, size: metaCsv.length, type: "text/csv" },
        uploadPath: `${outputDirectory}/${col.project}-${col._id}-meta.csv`,
      });
      await storage.upload({
        file: {
          buffer: utterancesCsv,
          size: utterancesCsv.length,
          type: "text/csv",
        },
        uploadPath: `${outputDirectory}/${col.project}-${col._id}-utterances.csv`,
      });
    } else {
      const metaJsonl = Buffer.from('{"runId":"123","runName":"Test Run"}');
      const sessionsJsonl = Buffer.from(
        '{"_id":"session1","transcript":[{"text":"Hello"}]}',
      );

      await storage.upload({
        file: {
          buffer: metaJsonl,
          size: metaJsonl.length,
          type: "application/x-ndjson",
        },
        uploadPath: `${outputDirectory}/${col.project}-${col._id}-meta.jsonl`,
      });
      await storage.upload({
        file: {
          buffer: sessionsJsonl,
          size: sessionsJsonl.length,
          type: "application/x-ndjson",
        },
        uploadPath: `${outputDirectory}/${col.project}-${col._id}-sessions.jsonl`,
      });
    }
  }

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({
      request: new Request(
        `http://localhost/api/downloads/${project._id}/collections/${collection._id}?exportType=CSV`,
      ),
      params: { projectId: project._id, collectionId: collection._id },
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when project not found", async () => {
    const fakeProjectId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request(
        `http://localhost/api/downloads/${fakeProjectId}/collections/${collection._id}?exportType=CSV`,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: fakeProjectId, collectionId: collection._id },
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("throws error when collection not found", async () => {
    const fakeCollectionId = new Types.ObjectId().toString();

    await expect(
      loader({
        request: new Request(
          `http://localhost/api/downloads/${project._id}/collections/${fakeCollectionId}?exportType=CSV`,
          { headers: { cookie: cookieHeader } },
        ),
        params: { projectId: project._id, collectionId: fakeCollectionId },
        context: {},
      } as any),
    ).rejects.toThrow("Collection not found.");
  });

  it("throws error when collection belongs to different project", async () => {
    const otherProject = await ProjectService.create({
      name: "Other Project",
      createdBy: user._id,
      team: team._id,
    });

    await expect(
      loader({
        request: new Request(
          `http://localhost/api/downloads/${otherProject._id}/collections/${collection._id}?exportType=CSV`,
          { headers: { cookie: cookieHeader } },
        ),
        params: { projectId: otherProject._id, collectionId: collection._id },
        context: {},
      } as any),
    ).rejects.toThrow("Collection not found.");
  });

  it("returns zip response for CSV export type", async () => {
    await uploadFakeExportFiles(collection, "CSV");

    const res = await loader({
      request: new Request(
        `http://localhost/api/downloads/${project._id}/collections/${collection._id}?exportType=CSV`,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, collectionId: collection._id },
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Content-Type")).toBe(
      "application/zip",
    );
    expect((res as Response).headers.get("Content-Disposition")).toContain(
      "attachment",
    );
    expect((res as Response).headers.get("Content-Disposition")).toContain(
      collection._id,
    );
  });

  it("returns zip response for JSONL export type", async () => {
    await uploadFakeExportFiles(collection, "JSONL");

    const res = await loader({
      request: new Request(
        `http://localhost/api/downloads/${project._id}/collections/${collection._id}?exportType=JSONL`,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, collectionId: collection._id },
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Content-Type")).toBe(
      "application/zip",
    );
    expect((res as Response).headers.get("Content-Disposition")).toContain(
      "attachment",
    );
    expect((res as Response).headers.get("Content-Disposition")).toContain(
      collection._id,
    );
  });
});
