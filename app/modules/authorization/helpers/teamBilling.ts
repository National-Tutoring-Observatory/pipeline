import type { Team } from "~/modules/teams/teams.types";
import type { User } from "~/modules/users/users.types";

export function userIsTeamBillingUser(
  user: User | null,
  team: Team | null,
): boolean {
  if (!user || !team) return false;
  return team.billingUser === user._id;
}
