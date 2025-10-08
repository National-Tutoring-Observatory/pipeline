import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Route } from "./+types/generateInviteToTeam.route";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { User } from "~/modules/users/users.types";
import find from 'lodash/find';
import crypto from 'crypto';

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { teamId, role, username } = payload;

  if (intent === 'GENERATE_INVITE_LINK') {

    const user = await getSessionUser({ request }) as User;
    let hasPermissionsToGenerateInvite = false;

    if (user.role === 'SUPER_ADMIN') {
      hasPermissionsToGenerateInvite = true;
    } else {
      const usersTeamPermissions = find(user.teams, { team: payload.teamId });

      if (usersTeamPermissions && usersTeamPermissions.role === 'ADMIN') {
        hasPermissionsToGenerateInvite = true;
      }
    }

    if (hasPermissionsToGenerateInvite) {

      const documents = getDocumentsAdapter();

      const inviteId = crypto.randomBytes(21).toString('hex').slice(0, 21);

      const newUser = await documents.createDocument({
        collection: 'users',
        update: {
          role: "USER",
          username,
          isRegistered: false,
          inviteId,
          invitedAt: new Date(),
          teams: [{
            team: teamId,
            role
          }],
          createdBy: user._id
        }
      });

      return newUser
    }
  }


  return {};
}