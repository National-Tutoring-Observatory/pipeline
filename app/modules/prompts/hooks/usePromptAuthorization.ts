import { useContext } from 'react';
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import type { User } from '~/modules/users/users.types';
import PromptAuthorization, { type PromptAuthorizationShape } from '../authorization';

export default function usePromptAuthorization(teamId: string | null = null): PromptAuthorizationShape {
  const user = useContext(AuthenticationContext) as User | null;

  const defaults: PromptAuthorizationShape = {
    canCreate: false,
    canView: false,
    canUpdate: false,
    canDelete: false,
  };

  if (!user || !teamId) return defaults;

  return {
    ...defaults,
    canCreate: PromptAuthorization.canCreate(user, teamId),
    canView: PromptAuthorization.canView(user, teamId),
    canUpdate: PromptAuthorization.canUpdate(user, teamId),
    canDelete: PromptAuthorization.canDelete(user, teamId),
  };
}
