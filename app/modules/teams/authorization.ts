import type { User } from "~/modules/users/users.types";
import { userIsSuperAdmin } from "../authorization/helpers/superAdmin";
import {
  userIsTeamAdmin,
  userIsTeamMember,
} from "../authorization/helpers/teamMembership";

const TeamAuthorization = {
  canCreate(user: User | null): boolean {
    return user !== null;
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

  Invites: {
    canView(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },

    canCreate(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },

    canRevoke(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },
  },
};

type UsersAuthorizationShape = {
  [K in keyof typeof TeamAuthorization.Users]: boolean;
};

type InvitesAuthorizationShape = {
  [K in keyof typeof TeamAuthorization.Invites]: boolean;
};

type TeamAuthorizationShape = {
  [K in Exclude<keyof typeof TeamAuthorization, "Users" | "Invites">]: boolean;
} & {
  users: UsersAuthorizationShape;
  invites: InvitesAuthorizationShape;
};

export default TeamAuthorization;
export type {
  InvitesAuthorizationShape,
  TeamAuthorizationShape,
  UsersAuthorizationShape,
};
