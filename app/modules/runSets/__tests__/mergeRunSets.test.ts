import { beforeEach, describe, expect, it } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import type { Project } from "~/modules/projects/projects.types";
import { RunSetService } from "~/modules/runSets/runSet";
import type { RunSet } from "~/modules/runSets/runSets.types";
import { SessionService } from "~/modules/sessions/session";
import type { Session } from "~/modules/sessions/sessions.types";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../test/helpers/createTestRun";

describe("RunSetService.findMergeableRunSets", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let project2: Project;
  let session1: Session;
  let session2: Session;
  let session3: Session;
  let targetRunSet: RunSet;

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

  it("returns runSets from same project with same sessions", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id, session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const mergeableRunSet = await RunSetService.create({
      name: "Mergeable RunSet",
      project: project._id,
      sessions: [session1._id, session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.findMergeableRunSets(targetRunSet._id);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(mergeableRunSet._id);
  });

  it("excludes runSets from different projects", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    await RunSetService.create({
      name: "Other Project RunSet",
      project: project2._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.findMergeableRunSets(targetRunSet._id);

    expect(result.data).toHaveLength(0);
  });

  it("excludes runSets with different sessions", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id, session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    await RunSetService.create({
      name: "Different Sessions RunSet",
      project: project._id,
      sessions: [session1._id, session3._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.findMergeableRunSets(targetRunSet._id);

    expect(result.data).toHaveLength(0);
  });

  it("excludes runSets with incompatible annotation types", async () => {
    const targetRun = await createTestRun({
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

    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [targetRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const incompatibleRun = await createTestRun({
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

    await RunSetService.create({
      name: "Incompatible RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [incompatibleRun._id],
      annotationType: "PER_SESSION",
    });

    const result = await RunSetService.findMergeableRunSets(targetRunSet._id);

    expect(result.data).toHaveLength(0);
  });

  it("excludes the target runSet itself", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.findMergeableRunSets(targetRunSet._id);

    expect(result.data).toHaveLength(0);
    expect(result.data.map((c) => c._id)).not.toContain(targetRunSet._id);
  });

  it("only includes runSets with matching annotation type", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const matchingRunSet = await RunSetService.create({
      name: "Matching RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    await RunSetService.create({
      name: "Non-matching RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_SESSION",
    });

    const result = await RunSetService.findMergeableRunSets(targetRunSet._id);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(matchingRunSet._id);
  });
});

describe("RunSetService.mergeRunSets", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let session1: Session;
  let targetRunSet: RunSet;

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
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const sourceRun = await createTestRun({
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

    const sourceRunSet = await RunSetService.create({
      name: "Source RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [sourceRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.mergeRunSets(
      targetRunSet._id,
      sourceRunSet._id,
    );

    expect(result.added).toHaveLength(1);
    expect(result.added).toContain(sourceRun._id);
    expect(result.skipped).toHaveLength(0);
    expect(result.runSet.runs).toHaveLength(1);
    expect(result.runSet.runs).toContain(sourceRun._id);
  });

  it("skips duplicate runs", async () => {
    const existingRun = await createTestRun({
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

    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const newRun = await createTestRun({
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

    const sourceRunSet = await RunSetService.create({
      name: "Source RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id, newRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.mergeRunSets(
      targetRunSet._id,
      sourceRunSet._id,
    );

    expect(result.added).toHaveLength(1);
    expect(result.added).toContain(newRun._id);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped).toContain(existingRun._id);
    expect(result.runSet.runs).toHaveLength(2);
  });

  it("keeps source runSet intact", async () => {
    const sourceRun = await createTestRun({
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

    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const sourceRunSet = await RunSetService.create({
      name: "Source RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [sourceRun._id],
      annotationType: "PER_UTTERANCE",
    });

    await RunSetService.mergeRunSets(targetRunSet._id, sourceRunSet._id);

    const updatedSource = await RunSetService.findById(sourceRunSet._id);
    expect(updatedSource).not.toBeNull();
    expect(updatedSource!.runs).toHaveLength(1);
    expect(updatedSource!.runs).toContain(sourceRun._id);
  });

  it("throws error for incompatible runSets", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const incompatibleRunSet = await RunSetService.create({
      name: "Incompatible RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_SESSION",
    });

    await expect(
      RunSetService.mergeRunSets(targetRunSet._id, incompatibleRunSet._id),
    ).rejects.toThrow("Run sets are not compatible for merging");
  });

  it("returns added and skipped counts", async () => {
    const existingRun = await createTestRun({
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

    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id],
      annotationType: "PER_UTTERANCE",
    });

    const newRun1 = await createTestRun({
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

    const newRun2 = await createTestRun({
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

    const sourceRunSet = await RunSetService.create({
      name: "Source RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [existingRun._id, newRun1._id, newRun2._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.mergeRunSets(
      targetRunSet._id,
      sourceRunSet._id,
    );

    expect(result.added).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(result.runSet.runs).toHaveLength(3);
  });

  it("merges multiple runSets at once", async () => {
    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const run1 = await createTestRun({
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

    const run2 = await createTestRun({
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

    const run3 = await createTestRun({
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

    const source1 = await RunSetService.create({
      name: "Source 1",
      project: project._id,
      sessions: [session1._id],
      runs: [run1._id],
      annotationType: "PER_UTTERANCE",
    });

    const source2 = await RunSetService.create({
      name: "Source 2",
      project: project._id,
      sessions: [session1._id],
      runs: [run2._id, run3._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.mergeRunSets(targetRunSet._id, [
      source1._id,
      source2._id,
    ]);

    expect(result.added).toHaveLength(3);
    expect(result.added).toContain(run1._id);
    expect(result.added).toContain(run2._id);
    expect(result.added).toContain(run3._id);
    expect(result.skipped).toHaveLength(0);
    expect(result.runSet.runs).toHaveLength(3);
  });

  it("deduplicates runs when merging multiple runSets with overlapping runs", async () => {
    const sharedRun = await createTestRun({
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

    const uniqueRun1 = await createTestRun({
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

    const uniqueRun2 = await createTestRun({
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

    targetRunSet = await RunSetService.create({
      name: "Target RunSet",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const source1 = await RunSetService.create({
      name: "Source 1",
      project: project._id,
      sessions: [session1._id],
      runs: [sharedRun._id, uniqueRun1._id],
      annotationType: "PER_UTTERANCE",
    });

    const source2 = await RunSetService.create({
      name: "Source 2",
      project: project._id,
      sessions: [session1._id],
      runs: [sharedRun._id, uniqueRun2._id],
      annotationType: "PER_UTTERANCE",
    });

    const result = await RunSetService.mergeRunSets(targetRunSet._id, [
      source1._id,
      source2._id,
    ]);

    expect(result.added).toHaveLength(3);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped).toContain(sharedRun._id);
    expect(result.runSet.runs).toHaveLength(3);
  });
});
