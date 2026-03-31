import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import { userIsTeamBillingUser } from "~/modules/authorization/helpers/teamBilling";
import {
  userIsTeamAdmin,
  userIsTeamMember,
} from "~/modules/authorization/helpers/teamMembership";
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

  canSetBillingUser(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
  },

  canAddCredits(user: User | null, team: Team | null): boolean {
    return userIsSuperAdmin(user) || userIsTeamBillingUser(user, team);
  },
};

export default BillingAuthorization;
