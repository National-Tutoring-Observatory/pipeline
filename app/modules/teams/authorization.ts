import type { User } from "~/modules/users/users.types";
import { userIsSuperAdmin } from "../authorization/helpers/superAdmin";
import {
  userIsTeamAdmin,
  userIsTeamMember,
} from "../authorization/helpers/teamMembership";

const TeamAuthorization = {
  canCreate(user: User | null): boolean {
    return userIsSuperAdmin(user);
  },

  canView(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user) || userIsTeamMember(user, teamId);
  },

  canUpdate(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canDelete(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  Users: {
    canView(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },

    canUpdate(user: User | null, teamId: string): boolean {
      return userIsTeamAdmin(user, teamId);
    },

    canInvite(user: User | null, teamId: string): boolean {
      return userIsTeamAdmin(user, teamId);
    },

    canRequestAccess(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) && !userIsTeamMember(user, teamId);
    },
  },
};

type UsersAuthorizationShape = {
  [K in keyof typeof TeamAuthorization.Users]: boolean;
};

type TeamAuthorizationShape = {
  [K in Exclude<keyof typeof TeamAuthorization, "Users">]: boolean;
} & {
  users: UsersAuthorizationShape;
};

export default TeamAuthorization;
export type { TeamAuthorizationShape, UsersAuthorizationShape };
