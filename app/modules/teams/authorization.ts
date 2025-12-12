import type { User } from '~/modules/users/users.types';
import { userIsSuperAdmin } from '../authorization/helpers/superAdmin';
import { userIsTeamAdmin, userIsTeamMember } from '../authorization/helpers/teamMembership';

const TeamAuthorization = {
  canCreate(user: User | null): boolean {
    return userIsSuperAdmin(user);
  },

  canView(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user) || userIsTeamMember(user, teamId);
  },

  canUpdate(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
  },

  canDelete(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user);
  },

  canInviteUsers(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
  },

  canManageUsers(user: User | null, teamId: string): boolean {
    return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
  },

  canAddSuperAdminToTeam(user: User | null): boolean {
    return userIsSuperAdmin(user);
  },
};

export default TeamAuthorization;
