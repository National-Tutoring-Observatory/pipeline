import type { User } from '~/modules/users/users.types';
import { userIsTeamAdmin, userIsTeamMember } from '../authorization/helpers/teamMembership';

const ProjectAuthorization = {
  canCreate(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canView(user: User | null, teamId: string): boolean {
    return userIsTeamMember(user, teamId);
  },

  canUpdate(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canDelete(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canManageRuns(user: User | null, teamId: string): boolean {
    return userIsTeamMember(user, teamId);
  },

  canManageAnnotations(user: User | null, teamId: string): boolean {
    return userIsTeamMember(user, teamId);
  },
};

export default ProjectAuthorization;
