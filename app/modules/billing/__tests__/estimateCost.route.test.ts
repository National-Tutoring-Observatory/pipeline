import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { getAvailableProviders } from "~/modules/llm/modelRegistry";
import { ProjectService } from "~/modules/projects/project";
import type { Project } from "~/modules/projects/projects.types";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import type { Prompt } from "~/modules/prompts/prompts.types";
import { calculateEstimate } from "~/modules/runSets/helpers/calculateEstimate";
import { SessionService } from "~/modules/sessions/session";
import type { Session } from "~/modules/sessions/sessions.types";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import expectAuthRequired from "../../../../test/helpers/expectAuthRequired";
import loginUser from "../../../../test/helpers/loginUser";
import { BillingPlanService } from "../billingPlan";
import { action } from "../containers/estimateCost.route";
import { TeamBillingService } from "../teamBilling";

const testModel = getAvailableProviders()[0].models[0].code;

describe("estimateCost.route", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let session: Session;
  let prompt: Prompt;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    team = await TeamService.create({ name: "Test Team" });
    user = await UserService.create({
      username: "test_user",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    session = await SessionService.create({
      name: "Test Session",
      project: project._id,
      inputTokens: 1000,
    });
    prompt = await PromptService.create({
      name: "Test Prompt",
      annotationType: "PER_UTTERANCE",
    });
    await PromptVersionService.create({
      prompt: prompt._id,
      version: 1,
      userPrompt: "Test prompt content",
      annotationSchema: [],
    });

    await BillingPlanService.create({
      name: "Default",
      markupRate: 1.5,
      isDefault: true,
    });
    await TeamBillingService.setupTeamBilling(team._id);
    await TeamBillingService.assignInitialCredits(team._id, user._id);

    cookieHeader = await loginUser(user._id);
  });

  function buildRequest(body: object, cookie?: string) {
    return {
      request: new Request("http://localhost/api/estimateCost", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
        body: JSON.stringify(body),
      }),
      params: {},
    } as any;
  }

  const definition = () => ({
    key: "test",
    modelCode: testModel,
    prompt: { promptId: prompt._id, promptName: "Test Prompt", version: 1 },
  });

  it("requires authentication", async () => {
    await expectAuthRequired(() =>
      action(
        buildRequest({
          intent: "ESTIMATE_COST",
          payload: {
            projectId: project._id,
            sessionIds: [session._id],
            definitions: [definition()],
            shouldRunVerification: false,
          },
        }),
      ),
    );
  });

  it("returns estimatedCost, estimatedTimeSeconds, and balance", async () => {
    const res = await action(
      buildRequest(
        {
          intent: "ESTIMATE_COST",
          payload: {
            projectId: project._id,
            sessionIds: [session._id],
            definitions: [definition()],
            shouldRunVerification: false,
          },
        },
        cookieHeader,
      ),
    );

    const result = (res as any).data ?? res;
    expect(result).toHaveProperty("estimatedCost");
    expect(result).toHaveProperty("estimatedTimeSeconds");
    expect(result).toHaveProperty("balance");
    expect(result.estimatedCost).toBeGreaterThan(0);
    expect(result.estimatedTimeSeconds).toBeGreaterThan(0);
    expect(result.balance).toBeGreaterThan(0);
  });

  it("returns estimated cost that includes markup rate", async () => {
    const res = await action(
      buildRequest(
        {
          intent: "ESTIMATE_COST",
          payload: {
            projectId: project._id,
            sessionIds: [session._id],
            definitions: [definition()],
            shouldRunVerification: false,
          },
        },
        cookieHeader,
      ),
    );

    const result = (res as any).data ?? res;

    const promptVersion = await PromptVersionService.findOne({
      prompt: prompt._id,
      version: 1,
    });
    const rawEstimate = calculateEstimate(
      [
        {
          modelCode: testModel,
          prompt: { inputTokens: promptVersion?.inputTokens },
        },
      ],
      [{ inputTokens: session.inputTokens }],
      { shouldRunVerification: false },
    );

    expect(result.estimatedCost).toBeCloseTo(
      rawEstimate.estimatedCost * 1.5,
      5,
    );
  });

  it("returns 400 when projectId is missing", async () => {
    const res = await action(
      buildRequest(
        {
          intent: "ESTIMATE_COST",
          payload: {
            sessionIds: [session._id],
            definitions: [definition()],
            shouldRunVerification: false,
          },
        },
        cookieHeader,
      ),
    );

    expect((res as any).init?.status).toBe(400);
  });

  it("returns 404 when project does not exist", async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await action(
      buildRequest(
        {
          intent: "ESTIMATE_COST",
          payload: {
            projectId: fakeId,
            sessionIds: [session._id],
            definitions: [definition()],
            shouldRunVerification: false,
          },
        },
        cookieHeader,
      ),
    );

    expect((res as any).init?.status).toBe(404);
  });

  it("returns 403 when user cannot view the project", async () => {
    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const otherCookie = await loginUser(otherUser._id);

    const res = await action(
      buildRequest(
        {
          intent: "ESTIMATE_COST",
          payload: {
            projectId: project._id,
            sessionIds: [session._id],
            definitions: [definition()],
            shouldRunVerification: false,
          },
        },
        otherCookie,
      ),
    );

    expect((res as any).init?.status).toBe(403);
  });
});
