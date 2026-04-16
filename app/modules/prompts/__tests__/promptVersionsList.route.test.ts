import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import expectAuthRequired from "../../../../test/helpers/expectAuthRequired";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/promptVersionsList.route";
import { PromptService } from "../prompt";
import { PromptVersionService } from "../promptVersion";

describe("promptVersionsList.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when there is no session cookie", async () => {
    await expectAuthRequired(() =>
      loader({
        request: new Request("http://localhost/"),
        params: {},
      } as any),
    );
  });

  it("redirects to / when prompt param is missing", async () => {
    const team = await TeamService.create({ name: "team" });
    const user = await UserService.create({
      username: "test",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: {},
    } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns only saved versions for a prompt", async () => {
    const team = await TeamService.create({ name: "team" });
    const user = await UserService.create({
      username: "test",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const prompt = await PromptService.create({
      name: "prompt",
      annotationType: "PER_UTTERANCE",
      team: team._id,
    });
    const savedVersion = await PromptVersionService.create({
      prompt: prompt._id,
      version: 1,
      name: "v1",
      userPrompt: "Do something",
      annotationSchema: [{ fieldKey: "label", value: "", isSystem: false }],
      hasBeenSaved: true,
    });
    const unsavedVersion = await PromptVersionService.create({
      prompt: prompt._id,
      version: 2,
      name: "v2",
      userPrompt: "",
      annotationSchema: [],
      hasBeenSaved: false,
    });

    const cookieHeader = await loginUser(user._id);

    const result = (await loader({
      request: new Request(`http://localhost/?prompt=${prompt._id}`, {
        headers: { cookie: cookieHeader },
      }),
      params: {},
    } as any)) as any;

    const versions = result.promptVersions.data;
    const versionNumbers = versions.map((v: any) => v.version);
    expect(versionNumbers).toContain(savedVersion.version);
    expect(versionNumbers).not.toContain(unsavedVersion.version);
  });

  it("returns empty array when prompt has no saved versions", async () => {
    const team = await TeamService.create({ name: "team" });
    const user = await UserService.create({
      username: "test",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const prompt = await PromptService.create({
      name: "prompt",
      annotationType: "PER_UTTERANCE",
      team: team._id,
    });
    await PromptVersionService.create({
      prompt: prompt._id,
      version: 1,
      name: "v1",
      userPrompt: "",
      annotationSchema: [],
      hasBeenSaved: false,
    });

    const cookieHeader = await loginUser(user._id);

    const result = (await loader({
      request: new Request(`http://localhost/?prompt=${prompt._id}`, {
        headers: { cookie: cookieHeader },
      }),
      params: {},
    } as any)) as any;

    expect(result.promptVersions.data).toHaveLength(0);
  });
});
