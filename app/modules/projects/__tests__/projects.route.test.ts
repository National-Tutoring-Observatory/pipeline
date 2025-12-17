import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Team } from "~/modules/teams/teams.types";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/projects.route";
import type { Project } from "../projects.types";

const documents = getDocumentsAdapter()

describe("projects.route loader - Team Filter Security", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  describe("Basic team filtering", () => {
    it("returns only projects from user's teams", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "test_user",
          teams: [{ team: team1._id, role: "ADMIN" }]
        }
      })).data;

      const project1 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 1", team: team1._id }
      })).data;

      const project2 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 2", team: team2._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/", { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const data = result.projects.data;
      expect(Array.isArray(data)).toBe(true)

      const ids = data.map((d: any) => d._id)
      expect(ids).toContain(project1._id)
      expect(ids).not.toContain(project2._id)
      expect(data).toHaveLength(1)
    })

    it("returns projects from multiple teams when user belongs to multiple teams", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;
      const team3 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 3" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "multi_team_user",
          teams: [
            { team: team1._id, role: "ADMIN" },
            { team: team2._id, role: "ADMIN" }
          ]
        }
      })).data;

      const project1 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 1", team: team1._id }
      })).data;

      const project2 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 2", team: team2._id }
      })).data;

      const project3 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 3", team: team3._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/", { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const data = result.projects.data;
      const ids = data.map((d: any) => d._id)

      expect(ids).toContain(project1._id)
      expect(ids).toContain(project2._id)
      expect(ids).not.toContain(project3._id)
      expect(data).toHaveLength(2)
    })

    it("returns empty list when user has no teams", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "no_team_user",
          teams: []
        }
      })).data;

      const project1 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 1", team: team1._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/", { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const data = result.projects.data;
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })
  })

  describe("Searching", () => {
    it("searches only within user's accessible teams", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "search_user",
          teams: [{ team: team1._id, role: "ADMIN" }]
        }
      })).data;

      const project1 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "Unique Alpha Project", team: team1._id }
      })).data;

      const project2 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "Unique Alpha Project 2", team: team2._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/?search=Alpha", { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const data = result.projects.data;
      const ids = data.map((d: any) => d._id)

      expect(ids).toContain(project1._id)
      expect(ids).not.toContain(project2._id)
    })

    it("prevents access to other team projects even with explicit team in search", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "attacker_user",
          teams: [{ team: team1._id, role: "ADMIN" }]
        }
      })).data;

      const project1 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "public project", team: team1._id }
      })).data;

      const project2 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "public project", team: team2._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      // Both projects have the same name, but user should only see team1's version
      const result = (await loader({
        request: new Request("http://localhost/?search=public", { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const data = result.projects.data;
      const ids = data.map((d: any) => d._id)

      // Should only get the team1 project, not team2
      expect(ids).toContain(project1._id)
      expect(ids).not.toContain(project2._id)
    })
  })

  describe("Filtering", () => {
    it("ignores unauthorized team filters via query parameters", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "filter_hacker",
          teams: [{ team: team1._id, role: "ADMIN" }]
        }
      })).data;

      (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project in team 2", team: team2._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      // Try to use filters to access team2 - should not return team2 projects
      const result = (await loader({
        request: new Request(
          `http://localhost/?filters=${encodeURIComponent(JSON.stringify({ team: team2._id }))}`,
          { headers: { cookie: cookieHeader } }
        ),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const ids = result.projects.data.map((d: any) => d._id)
      expect(ids).toHaveLength(0)
    })

    it("ignores unauthorized team filters combined with search", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "search_filter_user",
          teams: [{ team: team1._id, role: "ADMIN" }]
        }
      })).data;

      (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "secret project", team: team2._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      // Try to search for project AND filter by team2 - should not return team2 projects
      const result = (await loader({
        request: new Request(
          `http://localhost/?searchValue=secret&filters=${encodeURIComponent(JSON.stringify({ team: team2._id }))}`,
          { headers: { cookie: cookieHeader } }
        ),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const ids = result.projects.data.map((d: any) => d._id)
      expect(ids).toHaveLength(0)
    })

    it("allows filtering without throwing errors", async () => {
      const team1 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
      const team2 = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

      const user = (await documents.createDocument<User>({
        collection: "users",
        update: {
          username: "filter_user_happy",
          teams: [
            { team: team1._id, role: "ADMIN" },
            { team: team2._id, role: "ADMIN" }
          ]
        }
      })).data;

      const project1 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project a", team: team1._id }
      })).data;

      const project2 = (await documents.createDocument<Project>({
        collection: "projects",
        update: { name: "project b", team: team2._id }
      })).data;

      const cookieHeader = await loginUser(user._id);

      // Filter by team1 should return only project1
      const resultWithFilter = (await loader({
        request: new Request(
          `http://localhost/?filter_team=${encodeURIComponent(team1._id)}`,
          { headers: { cookie: cookieHeader } }
        ),
        params: {},
        unstable_pattern: "",
        context: {},
      }) as any);

      const ids = resultWithFilter.projects.data.map((d: any) => d._id);
      expect(ids).toHaveLength(1);
      expect(ids).toContain(project1._id);
      expect(ids).not.toContain(project2._id);
    })
  })
})
