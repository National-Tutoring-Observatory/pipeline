import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { PromptService } from "../prompt";
import { PromptVersionService } from "../promptVersion";
import createDefaultPrompts from "../services/createDefaultPrompts.server";

describe("createDefaultPrompts", () => {
  let team: any;
  let user: any;

  beforeEach(async () => {
    await clearDocumentDB();
    team = await TeamService.create({ name: "test team" });
    user = await UserService.create({
      username: "test_user",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
  });

  it("creates the default prompts with correct names, types, and versions", async () => {
    await createDefaultPrompts(team._id, user._id);

    const prompts = await PromptService.find({
      match: { team: team._id },
      sort: { name: 1 },
    });

    expect(prompts).toHaveLength(3);

    expect(prompts[0].name).toBe("Talk Moves (sample prompt)");
    expect(prompts[0].annotationType).toBe("PER_UTTERANCE");

    expect(prompts[1].name).toBe("Tutor Moves (sample prompt)");
    expect(prompts[1].annotationType).toBe("PER_UTTERANCE");

    expect(prompts[2].name).toBe("Tutoring Quality Rubric (sample prompt)");
    expect(prompts[2].annotationType).toBe("PER_SESSION");

    for (const prompt of prompts) {
      expect(prompt.productionVersion).toBe(1);
      expect(prompt.createdBy).toBe(user._id);

      const versions = await PromptVersionService.find({
        match: { prompt: prompt._id },
      });
      expect(versions).toHaveLength(1);
      expect(versions[0].version).toBe(1);
      expect(versions[0].hasBeenSaved).toBe(true);
      expect(versions[0].userPrompt).not.toBe("");

      const schema = versions[0].annotationSchema;
      const systemFields = schema.filter((f: any) => f.isSystem);
      expect(systemFields).toHaveLength(3);
      expect(systemFields.map((f: any) => f.fieldKey)).toEqual([
        "_id",
        "identifiedBy",
        "reasoning",
      ]);

      const customFields = schema.filter((f: any) => !f.isSystem);
      expect(customFields.length).toBeGreaterThan(0);
    }
  });
});
