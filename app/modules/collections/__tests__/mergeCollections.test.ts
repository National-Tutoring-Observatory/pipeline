import { beforeEach, describe, expect, it } from "vitest";
import { CollectionService } from "~/modules/collections/collection";
import type { Collection } from "~/modules/collections/collections.types";
import { ProjectService } from "~/modules/projects/project";
import type { Project } from "~/modules/projects/projects.types";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import type { Session } from "~/modules/sessions/sessions.types";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";

describe("CollectionService.findMergeableCollections", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let project2: Project;
  let session1: Session;
  let session2: Session;
  let session3: Session;
  let targetCollection: Collection;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({ username: "test_user", teams: [] });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });

    project2 = await ProjectService.create({
      name: "Other Project",
      createdBy: user._id,
      team: team._id,
    });

    session1 = await SessionService.create({
      name: "Session 1",
      project: project._id,
    });
    session2 = await SessionService.create({
      name: "Session 2",
      project: project._id,
    });
    session3 = await SessionService.create({
      name: "Session 3",
      project: project._id,
    });
  });

  it("returns collections from same project with same sessions", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id, session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const mergeableCollection = await CollectionService.create({
      name: "Mergeable Collection",
      project: project._id,
      sessions: [session1._id, session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.findMergeableCollections(
      targetCollection._id,
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(mergeableCollection._id);
  });

  it("excludes collections from different projects", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    await CollectionService.create({
      name: "Other Project Collection",
      project: project2._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.findMergeableCollections(
      targetCollection._id,
    );

    expect(result.data).toHaveLength(0);
  });

  it("excludes collections with different sessions", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id, session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    await CollectionService.create({
      name: "Different Sessions Collection",
      project: project._id,
      sessions: [session1._id, session3._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.findMergeableCollections(
      targetCollection._id,
    );

    expect(result.data).toHaveLength(0);
  });

  it("excludes collections with incompatible annotation types", async () => {
    const targetRun = await RunService.create({
      name: "Target Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [targetRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const incompatibleRun = await RunService.create({
      name: "Incompatible Run",
      project: project._id,
      annotationType: "PER_SESSION",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    await CollectionService.create({
      name: "Incompatible Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [incompatibleRun._id],
      annotationType: "PER_SESSION",
    });

    const result = await CollectionService.findMergeableCollections(
      targetCollection._id,
    );

    expect(result.data).toHaveLength(0);
  });

  it("excludes the target collection itself", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.findMergeableCollections(
      targetCollection._id,
    );

    expect(result.data).toHaveLength(0);
    expect(result.data.map((c) => c._id)).not.toContain(targetCollection._id);
  });

  it("only includes collections with matching annotation type", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const matchingCollection = await CollectionService.create({
      name: "Matching Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    await CollectionService.create({
      name: "Non-matching Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_SESSION",
    });

    const result = await CollectionService.findMergeableCollections(
      targetCollection._id,
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(matchingCollection._id);
  });
});

describe("CollectionService.mergeCollections", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let session1: Session;
  let targetCollection: Collection;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({ username: "test_user", teams: [] });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });

    session1 = await SessionService.create({
      name: "Session 1",
      project: project._id,
    });
  });

  it("merges runs from source into target", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const sourceRun = await RunService.create({
      name: "Source Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const sourceCollection = await CollectionService.create({
      name: "Source Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [sourceRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.mergeCollections(
      targetCollection._id,
      sourceCollection._id,
    );

    expect(result.added).toHaveLength(1);
    expect(result.added).toContain(sourceRun._id);
    expect(result.skipped).toHaveLength(0);
    expect(result.collection.runs).toHaveLength(1);
    expect(result.collection.runs).toContain(sourceRun._id);
  });

  it("skips duplicate runs", async () => {
    const existingRun = await RunService.create({
      name: "Existing Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const newRun = await RunService.create({
      name: "New Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const sourceCollection = await CollectionService.create({
      name: "Source Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id, newRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.mergeCollections(
      targetCollection._id,
      sourceCollection._id,
    );

    expect(result.added).toHaveLength(1);
    expect(result.added).toContain(newRun._id);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped).toContain(existingRun._id);
    expect(result.collection.runs).toHaveLength(2);
  });

  it("keeps source collection intact", async () => {
    const sourceRun = await RunService.create({
      name: "Source Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const sourceCollection = await CollectionService.create({
      name: "Source Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [sourceRun._id],
      annotationType: "PER_UTTERANCE",
    });

    await CollectionService.mergeCollections(
      targetCollection._id,
      sourceCollection._id,
    );

    const updatedSource = await CollectionService.findById(
      sourceCollection._id,
    );
    expect(updatedSource).not.toBeNull();
    expect(updatedSource!.runs).toHaveLength(1);
    expect(updatedSource!.runs).toContain(sourceRun._id);
  });

  it("throws error for incompatible collections", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const incompatibleCollection = await CollectionService.create({
      name: "Incompatible Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_SESSION",
    });

    await expect(
      CollectionService.mergeCollections(
        targetCollection._id,
        incompatibleCollection._id,
      ),
    ).rejects.toThrow("Collections are not compatible for merging");
  });

  it("returns added and skipped counts", async () => {
    const existingRun = await RunService.create({
      name: "Existing Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const newRun1 = await RunService.create({
      name: "New Run 1",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const newRun2 = await RunService.create({
      name: "New Run 2",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const sourceCollection = await CollectionService.create({
      name: "Source Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id, newRun1._id, newRun2._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.mergeCollections(
      targetCollection._id,
      sourceCollection._id,
    );

    expect(result.added).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(result.collection.runs).toHaveLength(3);
  });

  it("merges multiple collections at once", async () => {
    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const run1 = await RunService.create({
      name: "Run 1",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const run2 = await RunService.create({
      name: "Run 2",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const run3 = await RunService.create({
      name: "Run 3",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const source1 = await CollectionService.create({
      name: "Source 1",
      project: project._id,
      sessions: [session1._id],
      runs: [run1._id],
      annotationType: "PER_UTTERANCE",
    });

    const source2 = await CollectionService.create({
      name: "Source 2",
      project: project._id,
      sessions: [session1._id],
      runs: [run2._id, run3._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.mergeCollections(
      targetCollection._id,
      [source1._id, source2._id],
    );

    expect(result.added).toHaveLength(3);
    expect(result.added).toContain(run1._id);
    expect(result.added).toContain(run2._id);
    expect(result.added).toContain(run3._id);
    expect(result.skipped).toHaveLength(0);
    expect(result.collection.runs).toHaveLength(3);
  });

  it("deduplicates runs when merging multiple collections with overlapping runs", async () => {
    const sharedRun = await RunService.create({
      name: "Shared Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const uniqueRun1 = await RunService.create({
      name: "Unique Run 1",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const uniqueRun2 = await RunService.create({
      name: "Unique Run 2",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session1._id,
          status: "DONE",
          name: "Session 1",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    targetCollection = await CollectionService.create({
      name: "Target Collection",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const source1 = await CollectionService.create({
      name: "Source 1",
      project: project._id,
      sessions: [session1._id],
      runs: [sharedRun._id, uniqueRun1._id],
      annotationType: "PER_UTTERANCE",
    });

    const source2 = await CollectionService.create({
      name: "Source 2",
      project: project._id,
      sessions: [session1._id],
      runs: [sharedRun._id, uniqueRun2._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await CollectionService.mergeCollections(
      targetCollection._id,
      [source1._id, source2._id],
    );

    expect(result.added).toHaveLength(3);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped).toContain(sharedRun._id);
    expect(result.collection.runs).toHaveLength(3);
  });
});
