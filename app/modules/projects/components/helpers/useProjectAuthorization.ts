import { useContext } from 'react';
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import type { User } from '~/modules/users/users.types';
import ProjectAuthorization from '../../authorization';

export default function useProjectAuthorization(teamId: string | null = null) {
  const user = useContext(AuthenticationContext) as User | null;

  const defaults = {
    canCreate: false,
    canView: false,
    canUpdate: false,
    canDelete: false,
  };

  if (!user || !teamId) return defaults;

  return {
    canCreate: ProjectAuthorization.canCreate(user, teamId),
    canView: ProjectAuthorization.canView(user, teamId),
    canUpdate: ProjectAuthorization.canUpdate(user, teamId),
    canDelete: ProjectAuthorization.canDelete(user, teamId),
  };
}
