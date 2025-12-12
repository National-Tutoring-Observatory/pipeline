import { useContext } from 'react';
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import type { User } from '~/modules/users/users.types';
import TeamAuthorization from '../../authorization';

export default function useTeamAuthorization(teamId: string | null = null) {
  const user = useContext(AuthenticationContext) as User | null;

  const defaults = {
    canCreate: user ? TeamAuthorization.canCreate(user) : false,
    canView: false,
    canUpdate: false,
    canDelete: false,
    canInviteUsers: false,
  };

  if (!user || !teamId) return defaults;

  return {
    ...defaults,
    canView: TeamAuthorization.canView(user, teamId),
    canUpdate: TeamAuthorization.canUpdate(user, teamId),
    canDelete: TeamAuthorization.canDelete(user, teamId),
    canInviteUsers: TeamAuthorization.canInviteUsers(user, teamId),
  };
}
