import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/prompts.route";
import { PromptService } from "../prompt";

describe("prompts.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("returns prompts across all user's teams", async () => {
    const team1 = await TeamService.create({ name: "Team 1" });
    const team2 = await TeamService.create({ name: "Team 2" });
    const user = await UserService.create({
      username: "test_user",
      teams: [
        { team: team1._id, role: "ADMIN" },
        { team: team2._id, role: "ADMIN" },
      ],
    });

    const prompt1 = await PromptService.create({
      name: "Prompt in Team 1",
      annotationType: "PER_UTTERANCE",
      team: team1._id,
    });
    const prompt2 = await PromptService.create({
      name: "Prompt in Team 2",
      annotationType: "PER_UTTERANCE",
      team: team2._id,
    });

    const cookieHeader = await loginUser(user._id);

    const res = (await loader({
      request: new Request("http://localhost/prompts", {
        headers: { cookie: cookieHeader },
      }),
      params: {},
      context: {},
    } as any)) as any;

    const ids = res.prompts.data.map((p: any) => p._id);
    expect(ids).toContain(prompt1._id);
    expect(ids).toContain(prompt2._id);
  });

  it("ignores team filter for teams the user does not belong to", async () => {
    const team1 = await TeamService.create({ name: "Team 1" });
    const team2 = await TeamService.create({ name: "Team 2" });
    const user = await UserService.create({
      username: "test_user",
      teams: [{ team: team1._id, role: "ADMIN" }],
    });

    await PromptService.create({
      name: "My Prompt",
      annotationType: "PER_UTTERANCE",
      team: team1._id,
    });

    const cookieHeader = await loginUser(user._id);

    const res = (await loader({
      request: new Request(
        `http://localhost/prompts?filter_team=${team2._id}`,
        { headers: { cookie: cookieHeader } },
      ),
      params: {},
      context: {},
    } as any)) as any;

    expect(res.prompts.data).toHaveLength(0);
  });

  it("filters prompts by team", async () => {
    const team1 = await TeamService.create({ name: "Team 1" });
    const team2 = await TeamService.create({ name: "Team 2" });
    const user = await UserService.create({
      username: "test_user",
      teams: [
        { team: team1._id, role: "ADMIN" },
        { team: team2._id, role: "ADMIN" },
      ],
    });

    const prompt1 = await PromptService.create({
      name: "Prompt in Team 1",
      annotationType: "PER_UTTERANCE",
      team: team1._id,
    });
    await PromptService.create({
      name: "Prompt in Team 2",
      annotationType: "PER_UTTERANCE",
      team: team2._id,
    });

    const cookieHeader = await loginUser(user._id);

    const res = (await loader({
      request: new Request(
        `http://localhost/prompts?filter_team=${team1._id}`,
        { headers: { cookie: cookieHeader } },
      ),
      params: {},
      context: {},
    } as any)) as any;

    expect(res.prompts.data).toHaveLength(1);
    expect(res.prompts.data[0]._id).toBe(prompt1._id);
  });
});
