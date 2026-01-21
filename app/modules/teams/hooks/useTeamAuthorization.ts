import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization, {
  type TeamAuthorizationShape,
} from "../authorization";

export default function useTeamAuthorization(
  teamId: string | null = null,
): TeamAuthorizationShape {
  const user = useContext(AuthenticationContext) as User | null;

  const defaults: TeamAuthorizationShape = {
    canCreate: TeamAuthorization.canCreate(user),
    canView: false,
    canUpdate: false,
    canDelete: false,
    users: {
      canView: false,
      canUpdate: false,
      canInvite: false,
      canRequestAccess: false,
    },
  };

  if (!teamId) return defaults;

  return {
    ...defaults,
    canView: TeamAuthorization.canView(user, teamId),
    canUpdate: TeamAuthorization.canUpdate(user, teamId),
    canDelete: TeamAuthorization.canDelete(user, teamId),
    users: {
      canView: TeamAuthorization.Users.canView(user, teamId),
      canUpdate: TeamAuthorization.Users.canUpdate(user, teamId),
      canInvite: TeamAuthorization.Users.canInvite(user, teamId),
      canRequestAccess: TeamAuthorization.Users.canRequestAccess(user, teamId),
    },
  };
}
