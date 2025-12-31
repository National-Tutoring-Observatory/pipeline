import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/promptsList.route";
import type { Prompt } from "../prompts.types.js";

const documents = getDocumentsAdapter()

describe("promptsList.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({ request: new Request("http://localhost/"), params: {} } as any)
    expect(res).toBeInstanceOf(Response)
    expect((res as Response).headers.get("Location")).toBe("/")
  })

  it("creates a session user and returns prompts filtered by annotationType + teamId (real adapter)", async () => {
    const team = await TeamService.create({ name: "team 1" });
    const teamOther = await TeamService.create({ name: "team 2" });

    const user = await UserService.create({ username: "test_1", teams: [{ team: team._id, role: "ADMIN" }] });
    const prompt = (await documents.createDocument<Prompt>({ collection: "prompts", update: { text: "prompt 1", annotationType: "PER_UTTERANCE", team: team._id } })).data;
    const promptOther = (await documents.createDocument<Prompt>({ collection: "prompts", update: { text: "prompt 2", annotationType: "PER_UTTERANCE", team: teamOther._id } })).data;

    const cookieHeader = await loginUser(user._id);

    const result = (await loader({
      request: new Request("http://localhost/?annotationType=PER_UTTERANCE", { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: "",
      context: {},
    }) as any);

    const data = result.prompts.data;
    expect(Array.isArray(data)).toBe(true)

    const ids = data.map((d: any) => d._id ?? d.id)
    expect(ids).toContain(prompt._id)
    expect(ids).not.toContain(promptOther._id)
  })

  it("throws when annotationType is invalid", async () => {
    const team = await TeamService.create({ name: "team" });
    const user = await UserService.create({ username: "test", teams: [{ team: team._id, role: "ADMIN" }] });

    const cookieHeader = await loginUser(user._id);

    await expect(loader({
      request: new Request("http://localhost/?annotationType=NOPE", { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: "",
      context: {},
    } as any)).rejects.toThrow(/Invalid or missing annotationType/)
  })

  it("throws when annotationType is missing", async () => {
    const team = await TeamService.create({ name: "team" });
    const user = await UserService.create({ username: "test", teams: [{ team: team._id, role: "ADMIN" }] });

    const cookieHeader = await loginUser(user._id);

    await expect(loader({
      request: new Request("http://localhost/", { headers: { cookie: cookieHeader } }),
      params: {},
      unstable_pattern: "",
      context: {},
    } as any)).rejects.toThrow(/Invalid or missing annotationType/)
  })
})
