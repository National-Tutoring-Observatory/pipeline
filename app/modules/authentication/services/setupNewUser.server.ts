import { TeamBillingService } from "~/modules/billing/teamBilling";
import { PromptService } from "~/modules/prompts/prompt";
import { TeamService } from "~/modules/teams/team";

export default async function setupNewUser(
  userId: string,
  workspaceName: string,
): Promise<void> {
  const team = await TeamService.createForUser(workspaceName, userId, {
    isPersonal: true,
  });
  await TeamBillingService.setupTeamBilling(team._id);
  await TeamBillingService.assignInitialCredits(team._id, userId);
  await PromptService.createDefaultPrompts(team._id, userId);
}
