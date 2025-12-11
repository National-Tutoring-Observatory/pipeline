import { useContext } from 'react';
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import type { User } from '~/modules/users/users.types';
import ProjectAuthorization, { type ProjectAuthorizationShape } from '../authorization';

export default function useProjectAuthorization(teamId: string | null = null): ProjectAuthorizationShape {
  const user = useContext(AuthenticationContext) as User | null;

  const defaults: ProjectAuthorizationShape = {
    canCreate: false,
    canView: false,
    canUpdate: false,
    canDelete: false,
    runs: {
      canManage: false,
    },
    annotations: {
      canManage: false,
    },
  };

  if (!user || !teamId) return defaults;

  return {
    ...defaults,
    canCreate: ProjectAuthorization.canCreate(user, teamId),
    canView: ProjectAuthorization.canView(user, teamId),
    canUpdate: ProjectAuthorization.canUpdate(user, teamId),
    canDelete: ProjectAuthorization.canDelete(user, teamId),
    runs: {
      canManage: ProjectAuthorization.Runs.canManage(user, teamId),
    },
    annotations: {
      canManage: ProjectAuthorization.Annotations.canManage(user, teamId),
    },
  };
}
