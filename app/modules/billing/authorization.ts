import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import { userIsTeamBillingUser } from "~/modules/authorization/helpers/teamBilling";
import { userIsTeamMember } from "~/modules/authorization/helpers/teamMembership";
import type { Team } from "~/modules/teams/teams.types";
import type { User } from "~/modules/users/users.types";

const BillingAuthorization = {
  canViewBilling(user: User | null, teamId: string): boolean {
    return userIsTeamMember(user, teamId);
  },

  canManageBilling(user: User | null, team: Team | null): boolean {
    return userIsSuperAdmin(user) || userIsTeamBillingUser(user, team);
  },

  canAssignPlan(user: User | null): boolean {
    return userIsSuperAdmin(user);
  },

  canSetBillingUser(user: User | null): boolean {
    return userIsSuperAdmin(user);
  },

  canAddCredits(user: User | null, team: Team | null): boolean {
    return userIsSuperAdmin(user) || userIsTeamBillingUser(user, team);
  },
};

type BillingAuthorizationShape = {
  [K in keyof typeof BillingAuthorization]: boolean;
};

export default BillingAuthorization;
export type { BillingAuthorizationShape };
