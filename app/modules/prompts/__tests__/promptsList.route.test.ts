import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Team } from "~/modules/teams/teams.types.js";
import type { User } from "~/modules/users/users.types.js";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/promptsList.route";
import type { Prompt } from "../prompts.types.js";

describe("promptsList.route loader — real documents adapter + real session", () => {
  const documents = getDocumentsAdapter()

  beforeEach(async () => {
    await clearDocumentDB()
  })
  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({ request: new Request("http://localhost/"), params: {} } as any)
    expect(res).toBeInstanceOf(Response)
    expect((res as Response).headers.get("Location")).toBe("/")
  })

  it("creates a session user and returns prompts filtered by annotationType + teamId (real adapter)", async () => {
    const documents = getDocumentsAdapter()

    const team = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 1" } })).data;
    const teamOther = (await documents.createDocument<Team>({ collection: "teams", update: { name: "team 2" } })).data;

    const user = (await documents.createDocument<User>({ collection: "users", update: { username: "test_1", teams: [{ team: team._id, role: "ADMIN" }] } })).data;
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
})
