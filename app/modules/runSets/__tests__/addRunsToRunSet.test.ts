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

describe("RunSetService.findEligibleRunsForRunSet", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let project2: Project;
  let session1: Session;
  let session2: Session;
  let session3: Session;
  let runSet: RunSet;

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

  describe("project invariant", () => {
    it("excludes runs from different projects", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id, session2._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      await createTestRun({
        name: "Run from other project",
        project: project2._id,
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
          {
            sessionId: session2._id,
            status: "DONE",
            name: "Session 2",
            fileType: "json",
            startedAt: new Date(),
            finishedAt: new Date(),
          },
        ],
      });

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(0);
    });

    it("includes runs from same project", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id, session2._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      const run = await createTestRun({
        name: "Run from same project",
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
          {
            sessionId: session2._id,
            status: "DONE",
            name: "Session 2",
            fileType: "json",
            startedAt: new Date(),
            finishedAt: new Date(),
          },
        ],
      });

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe(run._id);
    });
  });

  describe("annotation type invariant", () => {
    it("only includes runs with matching annotation type", async () => {
      runSet = await RunSetService.create({
        name: "Run Set",
        project: project._id,
        sessions: [session1._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      const matchingRun = await createTestRun({
        name: "Matching annotation type",
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

      await createTestRun({
        name: "Non-matching annotation type",
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

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe(matchingRun._id);
    });
  });

  describe("sessions invariant", () => {
    it("excludes runs with different sessions", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id, session2._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      await createTestRun({
        name: "Run with different sessions",
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
          {
            sessionId: session3._id,
            status: "DONE",
            name: "Session 3",
            fileType: "json",
            startedAt: new Date(),
            finishedAt: new Date(),
          },
        ],
      });

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(0);
    });

    it("includes runs with same sessions in different order", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id, session2._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      const run = await createTestRun({
        name: "Run with same sessions different order",
        project: project._id,
        annotationType: "PER_UTTERANCE",
        sessions: [
          {
            sessionId: session2._id,
            status: "DONE",
            name: "Session 2",
            fileType: "json",
            startedAt: new Date(),
            finishedAt: new Date(),
          },
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

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe(run._id);
    });

    it("excludes runs with subset of sessions", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id, session2._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      await createTestRun({
        name: "Run with subset of sessions",
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

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(0);
    });

    it("excludes runs with superset of sessions", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      await createTestRun({
        name: "Run with superset of sessions",
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
          {
            sessionId: session2._id,
            status: "DONE",
            name: "Session 2",
            fileType: "json",
            startedAt: new Date(),
            finishedAt: new Date(),
          },
        ],
      });

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(0);
    });
  });

  describe("duplicates", () => {
    it("excludes runs already in runSet", async () => {
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

      runSet = await RunSetService.create({
        name: "Test Run Set",
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

      const result = await RunSetService.findEligibleRunsForRunSet(runSet._id);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe(newRun._id);
    });
  });

  describe("pagination", () => {
    it("returns paginated results", async () => {
      runSet = await RunSetService.create({
        name: "Test Run Set",
        project: project._id,
        sessions: [session1._id],
        runs: [],
        annotationType: "PER_UTTERANCE",
      });

      for (let i = 0; i < 5; i++) {
        await createTestRun({
          name: `Run ${i}`,
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
      }

      const page1 = await RunSetService.findEligibleRunsForRunSet(runSet._id, {
        page: 1,
        pageSize: 3,
      });
      const page2 = await RunSetService.findEligibleRunsForRunSet(runSet._id, {
        page: 2,
        pageSize: 3,
      });

      expect(page1.data).toHaveLength(3);
      expect(page1.count).toBe(5);
      expect(page1.totalPages).toBe(2);

      expect(page2.data).toHaveLength(2);
      expect(page2.count).toBe(5);
      expect(page2.totalPages).toBe(2);
    });
  });
});

describe("RunSetService.addRunsToRunSet", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let project2: Project;
  let session1: Session;
  let session2: Session;
  let runSet: RunSet;

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
  });

  it("adds valid runs to runSet", async () => {
    runSet = await RunSetService.create({
      name: "Test Run Set",
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

    const result = await RunSetService.addRunsToRunSet(runSet._id, [
      run1._id,
      run2._id,
    ]);

    expect(result.added).toHaveLength(2);
    expect(result.added).toContain(run1._id);
    expect(result.added).toContain(run2._id);
    expect(result.skipped).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.runSet.runs).toHaveLength(2);
  });

  it("skips runs already in runSet", async () => {
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

    runSet = await RunSetService.create({
      name: "Test Run Set",
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

    const result = await RunSetService.addRunsToRunSet(runSet._id, [
      existingRun._id,
      newRun._id,
    ]);

    expect(result.added).toHaveLength(1);
    expect(result.added).toContain(newRun._id);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped).toContain(existingRun._id);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for runs that fail invariants", async () => {
    runSet = await RunSetService.create({
      name: "Test Run Set",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const invalidRun = await createTestRun({
      name: "Invalid Run - wrong sessions",
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
        {
          sessionId: session2._id,
          status: "DONE",
          name: "Session 2",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const result = await RunSetService.addRunsToRunSet(runSet._id, [
      invalidRun._id,
    ]);

    expect(result.added).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain(invalidRun._id);
  });

  it("handles mixed valid and invalid runs", async () => {
    runSet = await RunSetService.create({
      name: "Test Run Set",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const validRun = await createTestRun({
      name: "Valid Run",
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

    const invalidRun = await createTestRun({
      name: "Invalid Run - wrong project",
      project: project2._id,
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

    const result = await RunSetService.addRunsToRunSet(runSet._id, [
      validRun._id,
      invalidRun._id,
    ]);

    expect(result.added).toHaveLength(1);
    expect(result.added).toContain(validRun._id);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain(invalidRun._id);
    expect(result.runSet.runs).toHaveLength(1);
  });
});
