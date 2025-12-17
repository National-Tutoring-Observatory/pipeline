import type { User } from '~/modules/users/users.types';
import { userIsTeamAdmin, userIsTeamMember } from '../authorization/helpers/teamMembership';

const PromptAuthorization = {
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
};

type PromptAuthorizationShape = {
  [K in keyof typeof PromptAuthorization]: boolean;
};

export default PromptAuthorization;
export type { PromptAuthorizationShape };
